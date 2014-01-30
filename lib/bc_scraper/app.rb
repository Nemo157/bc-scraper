require 'sinatra/base'
require 'sinatra/json'

require_relative 'user'
require_relative 'album'

module BandcampScraper
  class App < Sinatra::Base
    set :root, File.realpath('../../', File.dirname(__FILE__))
    enable :logging

    get '/' do
      haml :index, format: :html5
    end

    get '/users/*' do |uri|
      user = User.new("http://#{uri}").load!
      user.save! unless user.stored?
      json user.to_hash(true)
    end

    get '/albums/*' do |uri|
      album = Album.new("http://#{uri}").load!
      album.save! unless album.stored?
      json album.to_hash(true)
    end
  end
end
