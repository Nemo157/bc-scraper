require 'uri'
require 'json'

require_relative 'item'
require_relative 'user'

module BandcampScraper
  class Album < Item
    include DataMapper::Resource

    property :uri, URI, key: true
    property :parsed?, Boolean
    property :created_at, DateTime
    property :updated_at, DateTime
    property :deleted_at, ParanoidDateTime

    def uri= uri
      super normalize_uri(uri)
    end

    property :artist, String
    property :title, String

    has n, :users, through: Resource

    def linked
      users
    end

    def parse_page doc
      self.artist = doc.css('[itemprop="byArtist"]').first.inner_text.strip
      self.title = doc.css('.trackTitle').first.inner_text.strip
      find_fans(doc).each do |fan|
        users << User.get_or_create(fan['url'])
      end
    end

    def find_fans doc
     fans = doc.css('script').map { |script| /TralbumFans\.initialize\((null|\[.*?\]), null, (?:true|null)\);/m.match(script.inner_text) }.compact.first[1] 
     JSON.parse(if fans == 'null' then '[]' else fans end) || []
    end

    def to_hash include_uri = false
      super.tap do |hash|
        hash[:artist] = artist
        hash[:title] = title
        hash[:fans] = users.map { |user| user.uri }.uniq
      end
    end
  end
end
