require 'uri'
require 'json'

require_relative 'item'
require_relative 'album'

module BandcampScraper
  class User < Item
    include DataMapper::Resource

    property :uri, URI, key: true
    property :parsed?, Boolean
    property :created_at, DateTime
    property :updated_at, DateTime
    property :deleted_at, ParanoidDateTime

    def uri= uri
      super normalize_uri(uri)
    end

    property :name, String

    has n, :albums, through: Resource

    def linked
      albums
    end

    def parse_page doc
      self.name = doc.css('.fan-name').first.inner_text.strip
      find_albums(doc).each do |key, value|
        albums << Album.get_or_create(value['item_url'])
      end
    end

    def find_albums doc
      JSON.parse(doc.css('script').map { |script|
        /var CollectionData = \{\n\s*item_details: (\{(?:.*?)\})(?:,\n\s*redownload_urls: null\n\};|\n\};)/m.match(script.inner_text)
      }.compact.first[1])
    end

    def to_hash include_uri = false
      super.tap do |hash|
        hash[:name] = name
        hash[:collected] = albums.map { |album| album.uri }.uniq
      end
    end
  end
end
