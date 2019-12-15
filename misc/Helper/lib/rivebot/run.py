from bot import RiveChatbot, BotSettings

settings = BotSettings()

bot = RiveChatbot(settings);
#print bot.parse("hello", {})

def main():
	#settings.FileSettings();
	#print "Skipping Loop"
	print 'Starting Chatbot...\n'
	bot.run();

if __name__ == "__main__":
	main()
