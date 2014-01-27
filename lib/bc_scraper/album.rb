require 'uri'
require 'json'

require_relative 'item'
require_relative 'user'

module BandcampScraper
  class Album < Item
    attr_reader :artist, :title, :users

    def aws_table_name
      'bandcamp-album'
    end

    def linked
      users
    end

    def from_hash hash
      @artist = hash[:artist]
      @title = hash[:title]
      @users = (hash[:users] || []).map { |uri| User.new(uri) }
      super
    end

    def parse_page doc
      {
        artist: doc.css('[itemprop="byArtist"]').first.inner_text.strip,
        title: doc.css('.trackTitle').first.inner_text.strip,
        users: find_users(doc).map { |fan| fan['url'] }
      }
    end

    def find_users doc
     users = doc.css('script').map { |script| /TralbumFans\.initialize\((null|\[.*?\]), null, (?:true|null)\);/m.match(script.inner_text) }.compact.first[1] 
     JSON.parse(if users == 'null' then '[]' else users end) || []
    end

    def to_hash include_uri = false
      super.tap do |hash|
        hash[:artist] = artist
        hash[:title] = title
        hash[:last_update] = last_update
        if users.any?
          hash[:users] = users.map { |user| user.uri }.uniq
        end
      end
    end
  end
end
