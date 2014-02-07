require 'open-uri'
require 'nokogiri'

require_relative 'memoizer'

module BandcampScraper
  class Item
    extend Memoizer
    attr_reader :uri, :last_update

    memoized :aws_table do AWS::DynamoDB::Table.new(aws_table_name).load_schema end
    memoized :aws_item do aws_table.items[uri] end

    def initialize options
      case options
      when String
        @uri = normalize_uri options
      when Hash
        @uri = normalize_uri options[:uri]
        from_hash normalize_hash options
      end
    end

    def loaded?
      @loaded
    end

    def stored?
      @stored ||= aws_item.exists?
    end

    def save!
      if loaded?
        puts "Saving #{self.class.name} #{uri}"
        if aws_item.exists?
          puts "Updating details"
          aws_item.attributes.set(strip_empty to_hash)
        else
          puts "Creating new entry"
          aws_table.items.create(strip_empty to_hash true)
          @stored = true
        end
      end
    end

    def load!
      puts "Loading #{self.class.name} #{uri}"
      unless loaded?
        from_hash(normalize_hash(load_aws || load_bandcamp))
      end
      self
    end

    def normalize_uri uri
      uri = URI(uri)
      uri.query = nil
      uri.scheme = 'http'
      uri.to_s
    end

    def normalize_hash hash
      Hash[hash.map { |key, value| [key.to_sym, value] }]
    end

    def from_hash hash
      @last_update = hash[:last_update] || 0
      @loaded = true
    end

    def load_aws
      puts "Checking AWS"
      if aws_item.exists?
        puts "Loading from AWS"
        aws_item.attributes.to_hash
      end
    end

    def load_bandcamp
      puts "Loading from Bandcamp"
      open uri do |page|
        begin
          parse_page(Nokogiri::HTML page).tap do |hash|
            hash[:last_update] = Time.now.to_i
          end
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

    def strip_empty input
      input.delete_if do |key, value|
        value.respond_to? :empty? and value.empty?
      end
    end
  end
end
