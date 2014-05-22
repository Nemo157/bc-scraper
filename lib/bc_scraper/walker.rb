require 'optparse'

require_relative 'album'
require_relative 'user'
require_relative 'setup'
require_relative 'next_algorithms'

module BandcampScraper
  class Walker
    def initialize
      @users = []
      @albums = []

      @parser = OptionParser.new do |opts|
        opts.on("-u", "--user URL", "User to start at") do |user|
          @users << user
        end

        opts.on("-a", "--album URL", "Album to start at") do |album|
          @albums << album
        end

        opts.on("-n", "--next-algo ", NextAlgorithms.keys, "Algorithm to determine which albums/users to visit next") do |next_algo|
          @next_algo = NextAlgorithms[next_algo.to_sym].new
        end
      end
    end

    def next_algo
      @next_algo ||= NextAlgorithms[:default].new
    end

    def run! argv
      @parser.parse(argv)

      if not (@users.any? || @albums.any?)
        puts @parser
        puts "Must specify at least one user or album"
        exit 2
      end

      queue = @users.map { |user| User.get_or_create(user) }
      queue += @albums.map { |album| Album.get_or_create(album) }

      continue = true
      trap("SIGINT") do
        exit unless continue
        puts
        puts "Exiting after current (SIGINT again to quit now)"
        continue = false
      end
      while continue && current = queue.pop
        begin
          current.parse and current.save! unless current.parsed?
          next_algo.process current, queue
        rescue
          puts "Error processing #{current.uri}: #{$!}"
          puts $!.backtrace
        end
      end
    end
  end
end
