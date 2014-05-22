require 'sinatra/base'
require 'sinatra/json'

require_relative 'user'
require_relative 'album'
#require_relative 'setup'

module BandcampScraper
  class App < Sinatra::Base
    set :root, File.realpath('../../', File.dirname(__FILE__))
    enable :logging

    get '/' do
      haml :index, format: :html5
    end

    get '/users/*' do |uri|
      user = User.get_or_create("http://#{uri}")
      user.parse and user.save! unless user.parsed?
      json user.to_hash(true)
    end

    get '/albums/*' do |uri|
      album = Album.get_or_create("http://#{uri}")
      album.parse and album.save! unless album.parsed?
      json album.to_hash(true)
    end
  end
end
