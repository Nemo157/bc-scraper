require 'open-uri'
require 'nokogiri'
require 'data_mapper'

module BandcampScraper
  class Item
    def normalize_uri original
      self.class.normalize_uri original
    end

    def parse
      puts "Loading from Bandcamp"
      open uri do |page|
        begin
          parse_page Nokogiri::HTML page, uri, 'utf8'
          self.parsed = true
        rescue
          puts "Error loading #{uri}: #{$!}"
          puts $!.backtrace
        end
      end
    end

    def to_hash include_uri = false
      if include_uri
        { uri: uri }
      else
        { }
      end
    end

    def self.get uri
      super normalize_uri(uri)
    end

    def self.get_or_create uri
      get(normalize_uri(uri)) || create(uri: uri)
    end

    def self.get_or_create_all uris
      uris = uris.map { |uri| normalize_uri uri }
      items = all(uri: uris).map { |item| item }
      found = items.map { |item| item.uri.to_s }
      items + uris.reject { |uri| found.include? uri.to_s }.map { |uri| create(uri: uri) }
    end

    def self.normalize_uri original
      URI(original.to_s.downcase).tap do |uri|
        uri.query = nil
        uri.scheme = 'http'
      end
    end

  end
end
