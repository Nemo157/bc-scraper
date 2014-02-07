require 'uri'
require 'json'

require_relative 'item'
require_relative 'album'

module BandcampScraper
  class User < Item
    attr_reader :name, :collected

    def aws_table_name
      'bandcamp-user'
    end

    def linked
      collected
    end

    def from_hash hash
      @name = hash[:name]
      @collected = (hash[:collected] || []).map { |uri| Album.new(uri) }
      super
    end

    def parse_page doc
      {
        name: doc.css('.fan-name').first.inner_text.strip,
        collected: find_albums(doc).map { |key, value| value['item_url'] }
      }
    end

    def find_albums doc
      JSON.parse(doc.css('script').map { |script|
        /var CollectionData = \{\n\s*item_details: (\{(?:.*?)\})\n\};/m.match(script.inner_text)
      }.compact.first[1])
    end

    def to_hash include_uri = false
      super.tap do |hash|
        hash[:name] = name
        hash[:last_update] = last_update
        hash[:collected] = collected.map { |album| album.uri }.uniq
      end
    end
  end
end
