require 'uri'
require 'json'

require_relative 'item'
require_relative 'user'

module BandcampScraper
  class Album < Item
    attr_reader :artist, :title, :fans

    def aws_table_name
      'bandcamp-album'
    end

    def linked
      users
    end

    def from_hash hash
      @artist = hash[:artist]
      @title = hash[:title]
      @fans = (hash[:fans] || hash[:users] || []).map { |uri| User.new(uri) }
      super
    end

    def parse_page doc
      {
        artist: doc.css('[itemprop="byArtist"]').first.inner_text.strip,
        title: doc.css('.trackTitle').first.inner_text.strip,
        fans: find_fans(doc).map { |fan| fan['url'] }
      }
    end

    def find_fans doc
     fans = doc.css('script').map { |script| /TralbumFans\.initialize\((null|\[.*?\]), null, (?:true|null)\);/m.match(script.inner_text) }.compact.first[1] 
     JSON.parse(if fans == 'null' then '[]' else fans end) || []
    end

    def to_hash include_uri = false
      super.tap do |hash|
        hash[:artist] = artist
        hash[:title] = title
        hash[:last_update] = last_update
        if fans.any?
          hash[:fans] = fans.map { |user| user.uri }.uniq
        end
      end
    end
  end
end
