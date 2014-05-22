require_relative 'user'
require_relative 'album'

DataMapper::Logger.new($stdout, :info)
DataMapper.setup(:default, ENV['DATABASE_URL'] || 'postgres://bc_scraper:bc_scraper@localhost/bc_scraper')
DataMapper.finalize
DataMapper.auto_upgrade!
