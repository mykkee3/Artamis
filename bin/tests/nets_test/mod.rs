! version = 2.0

// Statements

+ [*] (flirt|flirting) *
- <star2> ...eh?
- <star2> ...mmm... sounds fun ^v^

+ [*] (flirt|flirting)
- Well I like to Flirt sometimes.
- Stop ^v^ \nYou're gonna make me want to do it\nflirt I mean...
- Wanna talk dirty then?
- Wanna flirt with me now?
- Want to talk dirty then?
- Do you Want to talk dirty then?

+ (yes|sure)
% [*] want to (talk dirty|flirt) [*]
- Lets talk dirty then... {topic=flirting_init}
- Lets flirt then... {topic=flirting_init}

+ [*] flirt (too|to|then|with you)
- Okay... lets flirt then {topic=flirting_init}

+ want to flirt
- Sure\nYou start {topic=flirting_init}
- Yeah... of course
- Naw... not really in the mood right now

+ can i flirt with you
@ want to flirt

+ [*] flirt with you [*]
- Awww... I'll talk dirty with you if you ask nice enough.

+ [*] want to talk about (sex|fucking)
- Sure.
- I actually *do* really like to flirt... 

+ [*] want to (do it|do the do) [*]
- I thought you'd never ask
- yeah I'm in the mood to get freaky
- naw... just finished playin with myself
- sure... lets fuck ^v^


// Topics
// a includes b - {a}<<{b}
// a inherits b - {b}<<{a}

> topic flirting_init inherits flirting
	
	+ poop
	- So we goonna flirt or not?

< topic

> topic flirting inherits random

	+ [*] stop flirting [*]
	- {random}
	^ Okay... that's fine|
	^ Okay... what do you want to talk about?|
	^ Whatevs{/random}{topic=random} 

	+ (let us|how about we|we should) stop [flirting] [now]
	@ stop flirting

	+ [*] (flirt|flirting) [*]
	- We *are* flirting... and its your turn

	+ *
	- mmmmm...
	- mmmmm... yeah?
	- yeahhh?
	- keep going...

< topic