require 'data_mapper'

DataMapper::Logger.new($stdout, :info)
DataMapper::Property::String.length(255)

require_relative 'user'
require_relative 'album'

DataMapper.setup(:default, ENV['DATABASE_URL'] || 'postgres://bc_scraper:bc_scraper@localhost/bc_scraper')
DataMapper.finalize
DataMapper.auto_upgrade!
