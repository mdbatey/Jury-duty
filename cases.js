// All cases are made up. Some borrow the general shape of common real-world
// case types, but every name, place, and fact here is invented.
//
// The five computer jurors who deliberate with the player. They are the same
// people in every case. `likes` lists the kinds of evidence that move them
// most; `sway` is how easily they change their mind (1 = average).
window.JURORS = [
  {
    id: "ruth", name: "Ruth Abernathy", short: "Ruth", job: "Retired schoolteacher",
    bio: "Sticks to the rules. If the judge said to ignore something, she will remind you.",
    look: {skin: 1, hair: "bun", hairColor: "white", older: true, glasses: true, clothes: "#6b4f8a"},
    react: { agree: ["Mm-hm.", "Noted."], against: ["Hm.", "Oh dear."] },
    faces: { agree: "smug", against: "surprised" },
    approaches: { likes: "question", dislikes: "press" },
    replies: {
      records: { moved: "That's in the record. I can't ignore it.", unmoved: "One record doesn't settle it for me." },
      timeline: { moved: "When you lay out the times like that, it matters.", unmoved: "The timing could be a coincidence." },
      motive: { moved: "A reason isn't proof, but I'll weigh it.", unmoved: "Motive isn't evidence that anyone actually did anything." },
      physical: { moved: "Physical evidence carries weight. Fair point.", unmoved: "I'd want to know how that evidence was handled." },
      procedure: { moved: "If the rules weren't followed, that changes things.", unmoved: "Procedure matters, but I don't think that was a real misstep." },
      expert: { moved: "The expert was careful about that. I'll give it weight.", unmoved: "Experts can be wrong. I'm not deferring blindly." },
      witness: { moved: "That's what the witness actually said under oath.", unmoved: "Testimony alone doesn't carry it for me." },
      character: { moved: "How someone behaves does tell you something.", unmoved: "We're judging the evidence, not the person." }
    },
    likes: ["procedure", "records"], sway: 0.9,
    say: {
      agree: "Exactly my thinking.",
      moved: "That's a fair point. I hadn't weighed it that way.",
      unmoved: "I'm not sure that's enough to change my mind.",
      struck: "Hold on. The judge told us we can't use that. Let's stick to the evidence."
    }
  },
  {
    id: "dev", name: "Dev Malhotra", short: "Dev", job: "Software engineer",
    bio: "Wants timelines and records. Feelings don't do much for him.",
    look: {skin: 3, hair: "side", hairColor: "black", glasses: true, clothes: "#2e5a88"},
    react: { agree: ["Makes sense.", "Right."], against: ["Huh.", "Wait."] },
    faces: { agree: "smug", against: "surprised" },
    approaches: { likes: "facts", dislikes: "press" },
    replies: {
      records: { moved: "Okay, the records back that up.", unmoved: "The records don't line up with that for me." },
      timeline: { moved: "Huh. That timeline actually works.", unmoved: "The timeline still has gaps." },
      motive: { moved: "Fine, that's a reason. Noted.", unmoved: "Motive is just a story until something backs it up." },
      physical: { moved: "Hard evidence. I'll update on that.", unmoved: "That object could mean a lot of things." },
      procedure: { moved: "If the process was broken, the result is suspect.", unmoved: "Messy process, but it doesn't change the facts." },
      expert: { moved: "The expert's numbers make sense.", unmoved: "I'd want to see the expert's methods." },
      witness: { moved: "That testimony is specific. That counts.", unmoved: "One person's memory isn't data." },
      character: { moved: "Okay, patterns of behavior matter.", unmoved: "That's anecdotal." }
    },
    likes: ["records", "timeline"], sway: 1,
    say: {
      agree: "Right. The facts back that up.",
      moved: "Huh. That changes the math for me.",
      unmoved: "Maybe, but that doesn't really line up with the records."
    }
  },
  {
    id: "carla", name: "Carla Mendes", short: "Carla", job: "ER nurse",
    bio: "Reads people. Cares about why someone would do something and whether witnesses seem honest.",
    look: {skin: 2, hair: "long", hairColor: "brown", clothes: "#3e6b55"},
    react: { agree: ["Oh.", "Mm."], against: ["Oof.", "Oh no."] },
    faces: { agree: "surprised", against: "sad" },
    approaches: { likes: "question", dislikes: "press" },
    replies: {
      records: { moved: "Seeing it in writing makes it real.", unmoved: "Paper doesn't tell you what was in someone's heart." },
      timeline: { moved: "When you put it in order, it makes sense.", unmoved: "Times can be off. People make mistakes." },
      motive: { moved: "I can see why someone would do that. That matters.", unmoved: "Plenty of people have reasons and never act on them." },
      physical: { moved: "Okay. That's hard to argue with.", unmoved: "Things don't tell the whole story." },
      procedure: { moved: "That's not fair to anyone. It worries me.", unmoved: "Mistakes happen. People were doing their jobs." },
      expert: { moved: "If the expert says so, I'll listen.", unmoved: "Experts don't know these people." },
      witness: { moved: "I watched them say it. I believed them.", unmoved: "I'm not sure that witness was being straight with us." },
      character: { moved: "That tells me a lot about who they are.", unmoved: "Good people do bad things, and the other way around." }
    },
    likes: ["motive", "character", "witness"], sway: 1.1,
    say: {
      agree: "Yes. That's how I see it too.",
      moved: "Oh. I hadn't thought about it like that.",
      unmoved: "I hear you, but my gut still says otherwise."
    }
  },
  {
    id: "hank", name: "Hank Duffy", short: "Hank", job: "Retired contractor",
    bio: "Stubborn. Trusts things he can see and touch more than anyone's story.",
    look: {skin: 0, hair: "bald", hairColor: "gray", older: true, facial: "beard", clothes: "#8a3b3b"},
    react: { agree: ["Ha.", "Told ya."], against: ["Hmph.", "Nah."] },
    faces: { agree: "smug", against: "angry" },
    approaches: { likes: "press", dislikes: "question" },
    replies: {
      records: { moved: "Alright, it's written down. Fine.", unmoved: "Paperwork. Anybody can fill out paperwork." },
      timeline: { moved: "Huh. The clock doesn't lie.", unmoved: "Clocks, schmocks." },
      motive: { moved: "Yeah, people do dumb things for money.", unmoved: "Wanting something isn't doing it." },
      physical: { moved: "Now that's something I can see. Okay.", unmoved: "That doesn't prove what you think it proves." },
      procedure: { moved: "Sloppy work. I'll give you that.", unmoved: "They had a job to do. Cut them some slack." },
      expert: { moved: "Even I can follow that.", unmoved: "Experts. Paid to say whatever." },
      witness: { moved: "They were there. Hard to argue.", unmoved: "People see what they want to see." },
      character: { moved: "That tells you what kind of person we're dealing with.", unmoved: "Nice guy, bad guy, doesn't matter to me." }
    },
    likes: ["physical"], sway: 0.6,
    say: {
      agree: "Now you're talking.",
      moved: "...Alright. That one I can't argue with.",
      unmoved: "Nah. Not buying it."
    }
  },
  {
    id: "tasha", name: "Tasha Greene", short: "Tasha", job: "College student",
    bio: "Doesn't take authority at its word. Pays close attention to how police and experts did their jobs.",
    look: {skin: 5, hair: "curly", hairColor: "black", clothes: "#9a7420"},
    react: { agree: ["Exactly.", "See?"], against: ["Ugh.", "Really?"] },
    faces: { agree: "smug", against: "angry" },
    approaches: { likes: "question", dislikes: "facts" },
    replies: {
      records: { moved: "Okay, that's documented. Fair.", unmoved: "Who made that record, though?" },
      timeline: { moved: "That timeline is pretty hard to explain away.", unmoved: "Timelines get bent to fit a theory." },
      motive: { moved: "Okay, I see the motive.", unmoved: "Having a motive doesn't make someone guilty." },
      physical: { moved: "Physical evidence. Fine, that counts.", unmoved: "And who collected that evidence?" },
      procedure: { moved: "That's exactly the kind of thing that matters.", unmoved: "That's not really a procedure problem." },
      expert: { moved: "The research backs that up.", unmoved: "One expert isn't the whole science." },
      witness: { moved: "Okay, that testimony holds up.", unmoved: "I'm not sold on that witness." },
      character: { moved: "Alright, that says something.", unmoved: "Character attacks don't prove anything." }
    },
    likes: ["procedure", "expert"], sway: 1,
    say: {
      agree: "Thank you. Finally someone said it.",
      moved: "Okay, that's actually a good point.",
      unmoved: "That doesn't really prove anything though."
    }
  }
];

// How to add a case: copy one below and change it.
//
// steps: judge | opening | witness | closing | instructions
// Transcript lines are { q, a } pairs. Optional extras on a line:
//   card: "id"      the player can write this fact in their notebook
//   show: "label"   display the exhibit with that label
//   expression: "sad"   the witness's face for that answer (calm, nervous,
//                       angry, sad, smug, surprised). Default: nervous on
//                       cross-examination, calm otherwise.
//   sfx: "murmur"   the gallery murmurs after a surprising answer
//   mark: "name"    names a line so a contradiction can point at it
//   react: [{ juror, word, expression }]   hand-written computer juror
//                   reactions for this line (otherwise jurors who care about
//                   the fact's kind of evidence react on their own)
// Objection lines: { objection, by: "plaintiff" | "defense", ruling, note }
//
// cards: facts the player can collect and argue with in the jury room.
//   dir: 1 points toward guilty/liable, -1 toward not guilty/not liable
//   power: 1 to 3
//   tags: what kind of evidence it is (matches juror `likes`)
//   struck: set when the judge said the jury can't use it. Using it backfires.
//
// looks: each character's portrait, keyed by their name as it appears in the
//   case (skin 0-5 light to deep, hair, hairColor, facial, glasses, older,
//   clothes). Anyone without a look gets one generated from their name.
// contradictions: testimony that conflicts with an earlier fact. Each has an
//   id, the conflicting line's mark (line), the earlier fact it conflicts with
//   (conflictsWith), a bonus fact the finder earns (title, dir, power, tags),
//   and an explanation shown when it's found. Give each case one pointing
//   each way.
// A fact can also list rebuts: ["id"] (the facts it answers in deliberation)
//   and replies: { juror: { moved, unmoved } } for that juror's reply to it.
// jury.start: each juror's starting opinion, 0 to 100 (100 = sure of guilt).
// jury.takes: what each juror says first in the jury room.
// jury.points: arguments the computer jurors raise during deliberation.
// truth.lawful: the verdict the evidence at trial supports under the law.
// truth.actual: what really happened.

window.CASES = [
  {
    id: "night-deposit",
    title: "The Night Deposit",
    caption: "State v. Dana Whitlock",
    docket: "CR-2026-0412",
    kind: "criminal",
    charge: "Theft of more than $1,000 from an employer",
    blurb: "Over three weeks, $4,200 vanished from a small bakery's bank deposits. The assistant manager closed on most of those nights.",
    length: "About 20 minutes",
    looks: {
      "Court clerk": {skin: 2, hair: "short", hairColor: "brown", glasses: true, clothes: "#4a5568"},
      "Judge Harriet Vance": {skin: 5, hair: "short", hairColor: "gray", older: true, glasses: true, clothes: "#22262e"},
      "Prosecutor Renee Okafor": {skin: 4, hair: "bun", hairColor: "black", clothes: "#2e5a88"},
      "Defense attorney Sam Pruitt": {skin: 0, hair: "side", hairColor: "auburn", clothes: "#4a5568"},
      "Dana Whitlock": {skin: 1, hair: "ponytail", hairColor: "brown", clothes: "#3e6b55"},
      "Marty Feld": {skin: 0, hair: "bald", hairColor: "gray", older: true, facial: "mustache", clothes: "#9a7420"},
      "Detective Luis Arroyo": {skin: 3, hair: "short", hairColor: "black", facial: "mustache", clothes: "#5a4632"}
    },
    parties: {
      plaintiff: { label: "The State", lawyer: "Prosecutor Renee Okafor" },
      defense: { label: "Dana Whitlock", lawyer: "Defense attorney Sam Pruitt" }
    },
    cards: {
      "seven-nights": { title: "Seven of the nine short nights were Dana's", dir: 1, power: 3, tags: ["records"], rebuts: ["kyle-closed"], replies: { tasha: { unmoved: "Seven nights the bag sat in the safe. That's not seven nights she stole." }, carla: { moved: "Seven out of nine. That's hard to explain away." } } },
      "bag-video": { title: "Video shows Dana carrying the bag out on her nights", dir: 1, power: 1, tags: ["physical"] },
      "rent-text": { title: "Dana texted that she was desperate about rent", dir: 1, power: 2, tags: ["motive"], rebuts: ["slips-right"] },
      "cash-car": { title: "Dana paid $3,800 cash for a car in mid-April", dir: 1, power: 2, tags: ["records", "motive"] },
      "no-record-700": { title: "No record of Dana's $700 in coffee-can savings", dir: 1, power: 1, tags: ["records"], rebuts: ["tax-refund"] },
      "landlord": { title: "Landlord says Dana was two months behind on rent", dir: 1, power: 2, tags: ["motive"], struck: true },
      "plain-bags": { title: "The bank bags weren't tamper-evident", dir: -1, power: 2, tags: ["physical", "procedure"] },
      "kyle-alone": { title: "Kyle was alone with the safe for hours on Dana's nights", dir: -1, power: 3, tags: ["timeline"], rebuts: ["seven-nights", "bag-video"], replies: { hank: { moved: "Three hours alone with that safe? Okay, that's a problem.", unmoved: "Kyle's family. Marty trusted him." }, dev: { moved: "So the shortages follow the safe, not Dana. That's the real pattern." } } },
      "kyle-closed": { title: "Kyle closed on the other two short nights", dir: -1, power: 2, tags: ["records"], rebuts: ["seven-nights"] },
      "no-video": { title: "No video shows Dana taking any money", dir: -1, power: 2, tags: ["physical"], rebuts: ["bag-video"] },
      "tax-refund": { title: "A $3,100 tax refund was withdrawn the day before the car purchase", dir: -1, power: 3, tags: ["records"], rebuts: ["cash-car"], replies: { dev: { moved: "$3,100 in, $3,100 out, and the car bought the next day. That math works." }, hank: { unmoved: "A refund doesn't cover the whole $3,800." } } },
      "not-investigated": { title: "The detective never investigated Kyle", dir: -1, power: 2, tags: ["procedure"] },
      "slips-right": { title: "Dana says she counted twice and the slips were right", dir: -1, power: 1, tags: ["character"] },
      "kyle-advance": { title: "Kyle asked for a pay advance in April", dir: -1, power: 2, tags: ["motive", "records"] },
      "safe-overnight": { title: "Dana kept the bag in the safe overnight and dropped it at the bank each morning", dir: -1, power: 1, tags: ["timeline"] },
      "late-entries": { title: "Dana's code opened the back door late at night on four of her closing nights", dir: 1, power: 2, tags: ["records", "timeline"], rebuts: ["kyle-alone", "slips-right"], replies: { carla: { moved: "Why would she come back at midnight? That scares me." } } },
      "dana-never": { title: "Dana never once did a same-night drop after January", dir: -1, power: 1, tags: ["timeline"] }
    },
    steps: [
      {
        type: "judge",
        speaker: "Judge Harriet Vance",
        text: [
          "Good morning, members of the jury. Thank you for being here.",
          "The defendant, Dana Whitlock, is charged with stealing more than $1,000 from her employer, Crumb & Co. Bakery. She has pleaded not guilty.",
          "The charge is only an accusation. It is not evidence. Ms. Whitlock is presumed innocent unless the State proves her guilty beyond a reasonable doubt.",
          "Listen carefully, and don't make up your mind until you've heard everything and talked it over in the jury room."
        ]
      },
      {
        type: "opening",
        side: "plaintiff",
        speaker: "Prosecutor Renee Okafor",
        text: [
          "Crumb & Co. is a six-person bakery. Every night, whoever closes counts the cash, writes the total on a deposit slip, and zips it into a bag for the bank.",
          "On nine nights this spring, the bank found less money in that bag than the slip said. $4,200 in all.",
          "Dana Whitlock closed on seven of those nine nights. She was behind on rent. And in the middle of it all, she paid $3,800 in cash for a used car.",
          "When you put the pieces together, they point to one person."
        ]
      },
      {
        type: "opening",
        side: "defense",
        speaker: "Defense attorney Sam Pruitt",
        text: [
          "Dana has worked at Crumb & Co. for four years. She was trusted with the keys from her second month.",
          "The State will show you a pattern. What they won't show you is anyone seeing Dana take a single dollar.",
          "Dana locked the bag in the office safe overnight and dropped it at the bank the next morning. That bag sat in the safe for hours, and Dana wasn't the only one who could open it.",
          "And the car money? You'll see where it came from."
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Marty Feld",
        role: "Owner of Crumb & Co.",
        direct: [
          { q: "Mr. Feld, how did you find out money was missing?", a: "The bank called me. Our deposits were coming up short. A couple hundred here, six hundred there." },
          { q: "How is a deposit supposed to work at your bakery?", a: "The closer counts the drawer, fills out the slip, zips the cash and slip into the bank bag. Then it goes to the bank's night drop." },
          { q: "Did everyone follow that routine?", a: "Mostly. Dana liked to put the bag in the office safe and drop it at the bank on her way in the next morning. She said the night drop was on a dark street.", card: "safe-overnight" },
          { q: "I'm showing you State's Exhibit 1. What is it?", a: "The list of short deposits the bank sent me, with who closed each night. Dana's name is on seven of the nine.", card: "seven-nights", show: "State's Exhibit 1" }
        ],
        cross: [
          { q: "Mr. Feld, the bank bags you use. Are they the tamper-evident kind, that show if they've been opened?", a: "No. They're plain zipper bags. The tamper-proof ones cost more.", card: "plain-bags" },
          { q: "Who knows the combination to the office safe?", a: "Me, Dana, and my nephew Kyle." },
          { q: "What does Kyle do at the bakery?", a: "He's our early baker. He comes in around four in the morning, alone, to start the bread." },
          { q: "So on the nights Dana put the bag in the safe, Kyle was alone in the building with it for about three hours before she arrived?", a: "I suppose so. But Kyle is family.", card: "kyle-alone", expression: "surprised", sfx: "murmur" },
          { q: "The two short nights that weren't Dana's. Who closed those?", a: "Kyle covered those two shifts.", card: "kyle-closed", react: [{ juror: "tasha", word: "Called it.", expression: "smug" }] }
        ],
        jurorQuestion: [
          { q: "Did Kyle have any money troubles that you know of?", a: "Not that I knew of. Well, he did ask me for an advance on his pay in April. I said no.", card: "kyle-advance" },
          { q: "Does the safe keep a record of when it's opened?", a: "No. It's an old dial safe. No log, no alarm." },
          { q: "Did Dana ever do a same-night drop after January?", a: "Not once that I know of. After a man followed her in January, she always used the safe.", card: "dana-never" }
        ],
        exhibits: [
          {
            label: "State's Exhibit 1",
            title: "Bank shortage report",
            body: "9 short deposits, April 3 to April 24\nTotal missing: $4,200\nClosed by D. Whitlock: 7 nights ($3,550)\nClosed by K. Feld: 2 nights ($650)"
          }
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Detective Luis Arroyo",
        role: "Investigating officer",
        direct: [
          { q: "Detective, what did you learn about Ms. Whitlock's finances?", a: "Her landlord told me she was two months behind on rent in March.", card: "landlord", react: [{ juror: "hank", word: "Figures.", expression: "smug" }, { juror: "carla", word: "Oof.", expression: "sad" }] },
          { objection: "Hearsay", by: "defense", ruling: "Sustained", note: "Hearsay is repeating what someone said outside of court to prove it's true. The landlord isn't here to be cross-examined, so the jury has to ignore that answer. If you wrote it down, you can't use it." },
          { q: "Let me ask it differently. What did you find on her phone, with a warrant?", a: "A text to her sister on April 2: 'If I don't come up with rent this month I'm done. I don't know what to do.'", card: "rent-text", show: "State's Exhibit 2" },
          { q: "Did you find any large purchases?", a: "On April 20 she bought a 2014 sedan from a private seller for $3,800. Cash.", card: "cash-car" },
          { q: "Did you check the bakery's alarm records?", a: "Yes. The back door was opened with Dana's code at about 11:40 p.m. on four of her closing nights, well after she'd locked up and left.", card: "late-entries" },
          { q: "Was there any video?", a: "One camera over the front register. It shows her carrying the bank bag out the door on each of her closing nights.", card: "bag-video", mark: "video-out" }
        ],
        cross: [
          { q: "Does that camera show the office, where the safe is?", a: "No." },
          { q: "Does any video show Ms. Whitlock opening a bag, or taking cash from anything?", a: "No.", card: "no-video" },
          { q: "I'm showing you Defense Exhibit A, her bank statement. What does it show?", a: "A tax refund deposit of $3,100 on April 15, and a $3,100 cash withdrawal on April 19. The day before she bought the car.", card: "tax-refund", sfx: "murmur", show: "Defense Exhibit A" },
          { q: "Did you check Kyle Feld's finances? His phone? His purchases?", a: "No. He wasn't a suspect.", card: "not-investigated" }
        ],
        exhibits: [
          {
            label: "State's Exhibit 2",
            title: "Text message, April 2",
            body: "From Dana to her sister:\n\"If I don't come up with rent this month\nI'm done. I don't know what to do.\""
          },
          {
            label: "Defense Exhibit A",
            title: "Dana Whitlock's bank statement",
            body: "Apr 15  IRS TREAS 310 TAX REF   +$3,100.00\nApr 19  CASH WITHDRAWAL            -$3,100.00"
          }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Dana Whitlock",
        role: "The defendant",
        intro: "A defendant never has to testify, and the jury can't hold it against them if they don't. Dana has chosen to testify.",
        direct: [
          { q: "Dana, did you take any money from Crumb & Co.?", a: "No. Never." },
          { q: "Why did you keep the bag in the safe overnight?", a: "The night drop is in an alley with no lights. A man followed me there once in January. After that I dropped it in the morning. Marty said that was fine." },
          { q: "After you locked the bag in the safe, did you ever come back that night?", a: "No. I locked up, went home, and didn't come back until morning.", mark: "never-back" },
          { q: "Where did the money for the car come from?", a: "My $3,100 tax refund, plus about $700 I'd saved in cash at home. My old car died and I needed to get to work." },
          { q: "What about that text to your sister?", a: "I was scared. I was behind on rent. But being broke doesn't make me a thief.", expression: "sad" }
        ],
        cross: [
          { q: "The $700 you say you had at home. Any record of that?", a: "No. It was cash in a coffee can.", card: "no-record-700" },
          { q: "You counted the money and wrote the slips yourself on those nights?", a: "Yes. And the slips were right. I counted twice.", card: "slips-right" },
          { q: "Did you ever see Kyle Feld take anything?", a: "No. I never saw him take anything." }
        ]
      },
      {
        type: "closing",
        side: "plaintiff",
        speaker: "Prosecutor Renee Okafor",
        text: [
          "Seven of nine nights. A desperate text about rent. A cash car purchase in the middle of it all.",
          "The defense wants you to blame someone who isn't on trial. But when Dana Whitlock closed, money disappeared.",
          "Use your common sense. The State asks for a verdict of guilty."
        ]
      },
      {
        type: "closing",
        side: "defense",
        speaker: "Defense attorney Sam Pruitt",
        text: [
          "The shortages didn't follow Dana. They followed the safe. On her nights, the bag sat for hours in a building where one other person knew the combination and was there alone every morning.",
          "The other two short nights? Kyle closed them.",
          "Nobody saw Dana take money. Her tax refund paid for the car. The detective never looked at anyone else.",
          "Maybe she could have done it. That's not enough. If you have a reasonable doubt, the law says your verdict must be not guilty."
        ]
      },
      {
        type: "instructions",
        speaker: "Judge Harriet Vance",
        text: [
          "To find Ms. Whitlock guilty, you must all agree the State proved beyond a reasonable doubt that money was taken from Crumb & Co. without permission, that Dana Whitlock took it, and that it was more than $1,000.",
          "Proof beyond a reasonable doubt leaves you firmly convinced. A reasonable doubt is one based on reason and common sense, not imagination.",
          "Circumstantial evidence, meaning facts that let you infer something else, counts just as much as direct evidence. You decide how much weight each piece deserves.",
          "Ms. Whitlock doesn't have to prove someone else did it. The State has to prove that she did.",
          "Your verdict must be unanimous."
        ]
      }
    ],
    contradictions: [
      {
        id: "c-video", line: "video-out", conflictsWith: "safe-overnight",
        bonus: { title: "The video can't show Dana taking the deposit: it stayed in the safe overnight", dir: -1, power: 3, tags: ["physical", "timeline"], rebuts: ["bag-video"] },
        explain: "Marty said Dana left the deposit bag in the safe overnight and took it to the bank the next morning. So whatever the register camera shows her carrying out at night, it isn't the deposit. The detective's video doesn't prove what he says it does."
      },
      {
        id: "c-late", line: "never-back", conflictsWith: "late-entries",
        bonus: { title: "Dana says she never came back at night, but her code opened the back door late", dir: 1, power: 3, tags: ["records", "character"], rebuts: ["kyle-alone"] },
        explain: "The alarm records show Dana's code opening the back door around 11:40 p.m. on four of her closing nights. She just said she never came back. Either she's mistaken or she's hiding something, and the safe was right there."
      }
    ],
    jury: {
      start: { ruth: 50, dev: 62, carla: 55, hank: 82, tasha: 30 },
      takes: {
        ruth: "Before we start: the State has to prove this beyond a reasonable doubt. Let's hold them to that.",
        dev: "The shortages line up pretty well with her shifts. I'd need a good reason to ignore that.",
        carla: "I feel for her. Being behind on rent is scary. But scared people do desperate things.",
        hank: "She was broke, money went missing on her nights, she bought a car with cash. Seems simple to me.",
        tasha: "The detective decided it was her on day one and never looked anywhere else."
      },
      points: [
        { dir: 1, text: "Seven out of nine nights. That's not a coincidence." },
        { dir: -1, text: "Being behind on rent isn't a crime. Plenty of people have been there." },
        { dir: 1, text: "Who pays cash for a car? That bothers me." },
        { dir: -1, text: "Kyle knew the combination and had hours alone with that bag. Nobody even checked him out." },
        { dir: 1, text: "She wrote the slips herself. She had every chance." },
        { dir: -1, text: "Nobody ever saw her take a dime. It's all guesswork." }
      ]
    },
    truth: {
      actual: "not-guilty",
      lawful: "not-guilty",
      headline: "Dana didn't do it.",
      story: "Kyle Feld had been taking a few hundred dollars from the bag on mornings he was alone with the safe. He owed money from sports betting, and he skimmed on the two nights he closed too. Months later, Marty bought tamper-evident bags and put a camera in the office, and the shortages stopped. Kyle eventually confessed. The late-night door codes were Dana's: on nights her heat had been shut off for unpaid bills, she slept in the bakery's break room, and she was too embarrassed to say so.",
      lesson: "A pattern can look damning. But the shortages lined up with when the bag sat in the safe, not with Dana herself. Circumstantial evidence can point the wrong way when an investigation only looks at one person."
    }
  },

  {
    id: "leaning-oak",
    title: "The Leaning Oak",
    caption: "Hollis v. Brandt",
    docket: "CV-2026-1187",
    kind: "civil",
    charge: "Negligence: failing to deal with a dangerous tree",
    blurb: "A storm brought a huge oak down onto a neighbor's garage. Was it bad luck, or did the owner ignore the warning signs?",
    length: "About 15 minutes",
    looks: {
      "Court clerk": {skin: 4, hair: "ponytail", hairColor: "black", clothes: "#4a5568"},
      "Judge Elena Moreau": {skin: 2, hair: "long", hairColor: "chestnut", glasses: true, clothes: "#22262e"},
      "Attorney Priya Natarajan": {skin: 3, hair: "long", hairColor: "black", clothes: "#8a3b3b"},
      "Attorney Tom Reyes": {skin: 2, hair: "short", hairColor: "black", facial: "beard", clothes: "#2e5a88"},
      "Joan Hollis": {skin: 1, hair: "curly", hairColor: "gray", older: true, glasses: true, clothes: "#6b4f8a"},
      "Gary Brandt": {skin: 0, hair: "buzz", hairColor: "blonde", clothes: "#3e6b55"},
      "Dr. Wendell Achebe": {skin: 5, hair: "short", hairColor: "gray", older: true, glasses: true, facial: "beard", clothes: "#4a5568"}
    },
    parties: {
      plaintiff: { label: "Joan Hollis", lawyer: "Attorney Priya Natarajan" },
      defense: { label: "Gary Brandt", lawyer: "Attorney Tom Reyes" }
    },
    cards: {
      "warning-signs": { title: "The lean, dead limbs and mushrooms were visible for years", dir: 1, power: 2, tags: ["physical"] },
      "letter": { title: "Joan warned Gary in writing eight months before", dir: 1, power: 3, tags: ["records"], rebuts: ["rick-experienced"], replies: { carla: { moved: "She put it in writing and offered to pay half. What else could she do?" }, hank: { unmoved: "A neighbor's note isn't a tree expert." } } },
      "insurance": { title: "Joan's insurance already paid part of her loss", dir: -1, power: 2, tags: ["records"], struck: true },
      "maple": { title: "A maple two houses down also fell in the storm", dir: -1, power: 1, tags: ["physical"] },
      "rot-70": { title: "The trunk was 70% rotten where it broke", dir: 1, power: 3, tags: ["expert", "physical"], rebuts: ["storm-63", "healthy-fell"], replies: { hank: { moved: "Seventy percent hollow. I've seen beams like that. They go." }, tasha: { unmoved: "The plaintiff paid for that number." } } },
      "detectable": { title: "A 10-minute drill test would have found the rot", dir: 1, power: 2, tags: ["expert", "procedure"] },
      "would-survive": { title: "A healthy oak would more likely than not have survived", dir: 1, power: 2, tags: ["expert"] },
      "paid-expert": { title: "The arborist is paid $250 an hour to testify", dir: -1, power: 1, tags: ["expert"] },
      "healthy-fell": { title: "Some healthy trees fell in the storm too", dir: -1, power: 2, tags: ["expert", "physical"], rebuts: ["would-survive", "rot-70"] },
      "not-certain": { title: "The expert can't say for sure the tree would have survived", dir: -1, power: 2, tags: ["expert"], rebuts: ["would-survive"] },
      "rick-experienced": { title: "Rick has 20 years of experience with trees", dir: -1, power: 2, tags: ["character"], rebuts: ["not-certified"] },
      "storm-63": { title: "Gary's weather station recorded a 63 mph gust", dir: -1, power: 2, tags: ["physical", "records"], rebuts: ["letter", "warning-signs"], replies: { dev: { moved: "Sixty-three miles an hour is a real storm. That's a factor." }, carla: { unmoved: "Storms happen. Joan warned him anyway." } } },
      "not-certified": { title: "Rick is not a certified arborist", dir: 1, power: 1, tags: ["expert"], rebuts: ["rick-experienced"] },
      "sidewalk-look": { title: "Rick only looked from the sidewalk, for about 10 minutes", dir: 1, power: 3, tags: ["procedure"], rebuts: ["rick-experienced"], replies: { ruth: { moved: "Ten minutes from the sidewalk isn't an inspection." }, hank: { unmoved: "Plenty of guys can size up a tree from the curb." } } },
      "declined-split": { title: "Gary turned down Joan's offer to split an inspection", dir: 1, power: 2, tags: ["character"] },
      "rick-absent": { title: "Rick didn't come to court to be questioned", dir: 1, power: 1, tags: ["procedure"] },
      "no-mulch": { title: "There was no mulch around the oak, just bare dirt", dir: 1, power: 1, tags: ["physical"] },
      "week-later": { title: "Dr. Achebe examined the stump and trunk about a week after the storm", dir: 1, power: 1, tags: ["expert"] },
      "trunk-gone": { title: "The city hauled the trunk away two days after the storm", dir: -1, power: 1, tags: ["physical", "records"] },
      "maple-rotten": { title: "The maple that fell was badly rotted too", dir: 1, power: 2, tags: ["expert", "physical"], rebuts: ["healthy-fell", "maple"] },
      "cheap-fix": { title: "Removing the oak would have cost about $3,000", dir: 1, power: 1, tags: ["records"] },
      "snapped": { title: "The oak snapped at the trunk instead of uprooting", dir: 1, power: 2, tags: ["physical"], rebuts: ["storm-63"] }
    },
    steps: [
      {
        type: "judge",
        speaker: "Judge Elena Moreau",
        text: [
          "Welcome, members of the jury. This is a civil case, not a criminal one. Nobody is accused of a crime.",
          "The plaintiff, Joan Hollis, says her neighbor Gary Brandt carelessly ignored a dying oak tree, and that it fell on her garage and car. She asks for $14,500.",
          "Mr. Brandt says he acted reasonably, and that a severe storm knocked the tree down.",
          "In a civil case, the plaintiff has to prove her case by a preponderance of the evidence. I'll explain what that means at the end."
        ]
      },
      {
        type: "opening",
        side: "plaintiff",
        speaker: "Attorney Priya Natarajan",
        text: [
          "For two years, Joan Hollis watched the big oak next door lean further toward her garage. Dead branches dropped onto her driveway. Mushrooms grew at its base.",
          "Eight months before it fell, she wrote Mr. Brandt a letter asking him to have it checked.",
          "He never hired a certified arborist. He asked his brother-in-law to take a look from the sidewalk.",
          "Healthy trees usually survive storms. This tree was rotten inside, and a careful owner would have known it."
        ]
      },
      {
        type: "opening",
        side: "defense",
        speaker: "Attorney Tom Reyes",
        text: [
          "On the night of June 9, a storm hit with gusts over 60 miles an hour and knocked down trees all over town.",
          "When Gary got Ms. Hollis's letter, he didn't ignore it. He had someone with twenty years of experience come look. That person said the tree was fine.",
          "Gary isn't a tree expert. He did what most of us would do. The law doesn't make homeowners pay for acts of nature."
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Joan Hollis",
        role: "The plaintiff",
        direct: [
          { q: "Ms. Hollis, what did you notice about the oak before it fell?", a: "It leaned more every year toward my garage. Big dead branches fell on my driveway. And there were big shelf mushrooms growing at the bottom of the trunk.", card: "warning-signs" },
          { q: "Was there mulch or a garden bed around the oak?", a: "No. Just bare dirt and roots. Nothing grows under that tree.", card: "no-mulch" },
          { q: "What did you do about it?", a: "I talked to Gary twice. Then I wrote him a letter, because I wanted it on paper. This is it.", card: "letter", show: "Plaintiff's Exhibit 1" },
          { q: "What happened on June 9?", a: "Around 11 at night there was a huge crack, then a crash. The oak split near the bottom and fell right across my garage. It crushed the roof and my car inside.", expression: "sad" }
        ],
        cross: [
          { q: "Ms. Hollis, you're not a tree expert, are you?", a: "No. I looked it up online, and it said those mushrooms can mean rot." },
          { q: "Your homeowner's insurance has already paid part of your loss, hasn't it?", a: "Some of it. Not all.", card: "insurance" },
          { objection: "Relevance. Insurance", by: "plaintiff", ruling: "Sustained", note: "Juries usually aren't allowed to consider insurance. Whether someone had insurance has nothing to do with who was at fault. That answer can't be used." },
          { q: "Other trees came down in that storm, didn't they? On your street?", a: "Yes. A maple came down two houses over.", card: "maple", sfx: "murmur" }
        ],
        exhibits: [
          {
            label: "Plaintiff's Exhibit 1",
            title: "Letter to Gary Brandt, October 14",
            body: "Gary,\nI'm worried about the oak by the fence. It keeps\nleaning toward my garage and branches keep falling.\nThere are mushrooms growing at the base. Could you\nhave a tree expert look at it before winter? I'm\nhappy to split the cost of an inspection.\nThanks, Joan"
          }
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Dr. Wendell Achebe",
        role: "Certified arborist, expert witness",
        intro: "An expert witness may give opinions about their specialty. Ordinary witnesses can only say what they saw or heard. You don't have to accept an expert's opinion.",
        direct: [
          { q: "Dr. Achebe, when did you examine the tree?", a: "About a week after the storm. I examined the stump and the fallen trunk, and took cross-sections.", card: "week-later" },
          { q: "What did you find?", a: "Advanced heart rot. About 70 percent of the trunk's interior was decayed at the break. The mushrooms Ms. Hollis saw are the fruiting bodies of a rot fungus.", card: "rot-70", sfx: "murmur", show: "Plaintiff's Exhibit 2" },
          { q: "Would a certified arborist have noticed that?", a: "Almost certainly. The fungus, the lean and the dead limbs are textbook warning signs. A resistance drill test would have confirmed the rot in about ten minutes.", card: "detectable", expression: "smug" },
          { q: "Would a healthy oak have survived the storm?", a: "In my opinion, more likely than not, yes. A trunk that's 70 percent hollow has very little strength left.", card: "would-survive" }
        ],
        cross: [
          { q: "Doctor, you're being paid for your time here?", a: "Yes. My standard rate of $250 an hour, whatever I conclude.", card: "paid-expert" },
          { q: "You agree that healthy trees fell in this storm?", a: "Some did, yes.", card: "healthy-fell" },
          { q: "So you can't say for certain this tree would have survived.", a: "Not for certain. I can say it's more likely than not.", card: "not-certain" }
        ],
        jurorQuestion: [
          { q: "Did you look at the maple that fell two houses down?", a: "I did, on my way out. It had significant decay at the base as well.", card: "maple-rotten" },
          { q: "How much would it have cost to remove the oak?", a: "For a tree that size, typically $2,500 to $3,500.", card: "cheap-fix" },
          { q: "Can soaked soil knock over a healthy tree?", a: "Yes, saturated soil can uproot healthy trees. But this oak didn't uproot. It snapped at the trunk, right where the rot was.", card: "snapped" }
        ],
        exhibits: [
          {
            label: "Plaintiff's Exhibit 2",
            title: "Arborist's report (summary)",
            body: "Species: Red oak, approx. 80 years old\nFailure point: 3 ft above ground\nInterior decay at failure point: approx. 70%\nWarning signs: fungal conks at base, 12° lean,\ndead limbs in crown"
          }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Gary Brandt",
        role: "The defendant",
        direct: [
          { q: "Mr. Brandt, what did you do when you got Ms. Hollis's letter?", a: "I called my brother-in-law, Rick. He's run a landscaping business for twenty years and takes down trees all the time.", card: "rick-experienced" },
          { q: "What did he tell you?", a: "Oaks lean, the mushrooms were from the mulch, and the tree had years left in it.", mark: "mulch" },
          { q: "What was the weather like on June 9?", a: "Terrible. I have a weather station on my roof. It recorded a gust of 63 miles an hour right around eleven.", card: "storm-63" },
          { q: "What happened to the tree after the storm?", a: "The city crew cut it up and hauled the trunk away two days later. Only the stump was left.", card: "trunk-gone", mark: "trunk-gone" }
        ],
        cross: [
          { q: "Mr. Brandt, Rick is not a certified arborist, is he?", a: "He's not certified. But he's experienced.", card: "not-certified" },
          { q: "Did Rick go into your yard, touch the tree, or test the trunk?", a: "He looked at it from the sidewalk and the driveway. Maybe ten minutes. He was dropping off a ladder anyway.", card: "sidewalk-look", react: [{ juror: "carla", word: "Wow.", expression: "surprised" }, { juror: "dev", word: "Ten minutes?", expression: "surprised" }] },
          { q: "Ms. Hollis offered to split the cost of a real inspection. Did you take her up on it?", a: "No. Rick already said it was fine.", card: "declined-split" },
          { q: "Rick isn't here today, is he?", a: "He's working.", card: "rick-absent" }
        ]
      },
      {
        type: "closing",
        side: "plaintiff",
        speaker: "Attorney Priya Natarajan",
        text: [
          "Mr. Brandt was warned in writing. He got a ten-minute look from the sidewalk by a relative who isn't an arborist and didn't come to answer questions.",
          "Dr. Achebe told you the rot was there to see, and a healthy tree would more likely than not have survived.",
          "We don't have to prove anything beyond a reasonable doubt. Only that it's more likely than not. We have."
        ]
      },
      {
        type: "closing",
        side: "defense",
        speaker: "Attorney Tom Reyes",
        text: [
          "Gary didn't ignore his neighbor. He asked someone with decades of experience. Most people never do even that.",
          "The plaintiff's own expert can't say for sure the tree would have survived. Healthy trees fell that night.",
          "A storm is no one's fault. Find that Gary Brandt is not responsible."
        ]
      },
      {
        type: "instructions",
        speaker: "Judge Elena Moreau",
        text: [
          "To find Mr. Brandt liable, Ms. Hollis must prove three things by a preponderance of the evidence: he knew or should have known the tree was dangerous, he failed to act as a reasonably careful homeowner would, and that failure was a substantial cause of the damage.",
          "Preponderance means more likely than not. Picture a balance scale. If the evidence tips it even slightly toward Ms. Hollis, she wins. If it's even, or tips toward Mr. Brandt, she does not.",
          "This is a much lower bar than in a criminal case. You don't need to be firmly convinced.",
          "In this case, at least five of the six jurors must agree on the verdict."
        ]
      }
    ],
    contradictions: [
      {
        id: "c-mulch", line: "mulch", conflictsWith: "no-mulch",
        bonus: { title: "Rick blamed the mushrooms on mulch, but there was no mulch around the oak", dir: 1, power: 3, tags: ["physical", "procedure"], rebuts: ["rick-experienced"] },
        explain: "Joan said nothing but bare dirt grows under that tree. If Rick thought the mushrooms came from mulch, he wasn't really looking at the tree."
      },
      {
        id: "c-trunk", line: "trunk-gone", conflictsWith: "week-later",
        bonus: { title: "The arborist says he examined the trunk a week later, but it was gone after two days", dir: -1, power: 3, tags: ["expert", "records"], rebuts: ["rot-70"] },
        explain: "If the city hauled the trunk away two days after the storm, Dr. Achebe couldn't have examined it a week later. That doesn't prove he's wrong about the rot, but it's a reason to question how carefully he worked."
      }
    ],
    jury: {
      start: { ruth: 48, dev: 42, carla: 62, hank: 24, tasha: 38 },
      takes: {
        ruth: "Remember, this is civil. More likely than not. That's a much lower bar than a criminal case.",
        dev: "For me it comes down to whether the tree would've fallen anyway.",
        carla: "Joan did everything right. She wrote a letter. She even offered to pay half.",
        hank: "I've seen storms like that flatten perfectly good trees. Nobody controls the wind.",
        tasha: "Paid experts always say what the side paying them wants. I'm not sold either way."
      },
      points: [
        { dir: -1, text: "A 60-mile-an-hour storm is an act of God. You can't blame a guy for the weather." },
        { dir: 1, text: "She warned him in writing. He had eight months." },
        { dir: -1, text: "He did ask someone. Most people wouldn't even do that." },
        { dir: 1, text: "Getting your brother-in-law to glance at it from the sidewalk isn't really checking." },
        { dir: -1, text: "Even the expert couldn't promise it would've survived." },
        { dir: 1, text: "Seventy percent rotten. That tree was a disaster waiting to happen." }
      ]
    },
    truth: {
      actual: "liable",
      lawful: "liable",
      headline: "The rot was the real cause.",
      story: "Rick never walked into the yard. He glanced at the tree while dropping off a ladder and told Gary what he wanted to hear. A certified arborist would have spotted the fungus and recommended removal for about $3,000. The maple two houses over was the only other tree on the street that fell, and it was badly decayed too. Dr. Achebe had mixed up his notes: he examined the stump and the city's photos of the trunk, not the trunk itself. The stump alone showed the rot.",
      lesson: "Civil cases use a much lower bar than criminal ones. You don't have to be sure. You only decide which side is more likely right. A storm can trigger the fall and someone can still be responsible."
    }
  },

  {
    id: "corner-store",
    title: "Two Minutes at the Counter",
    caption: "State v. Marcus Bell",
    docket: "CR-2026-0788",
    kind: "criminal",
    charge: "Armed robbery of a convenience store",
    blurb: "A clerk picked a man out of a photo lineup after a fast, frightening robbery. Is that enough to convict him?",
    length: "About 20 minutes",
    looks: {
      "Court clerk": {skin: 1, hair: "bun", hairColor: "chestnut", clothes: "#4a5568"},
      "Judge Raymond Ostrowski": {skin: 0, hair: "side", hairColor: "white", older: true, clothes: "#22262e"},
      "Prosecutor Allen Cho": {skin: 1, hair: "side", hairColor: "black", glasses: true, clothes: "#4a5568"},
      "Public defender Gloria Estes": {skin: 3, hair: "curly", hairColor: "black", clothes: "#8a3b3b"},
      "Marcus Bell": {skin: 4, hair: "buzz", hairColor: "black", facial: "beard", clothes: "#2f4f4f"},
      "Nadia Petrov": {skin: 0, hair: "long", hairColor: "blonde", clothes: "#2e5a88"},
      "Detective Frank Gilroy": {skin: 1, hair: "short", hairColor: "gray", older: true, facial: "mustache", clothes: "#5a4632"},
      "Dr. Simone Laurent": {skin: 2, hair: "bun", hairColor: "auburn", glasses: true, clothes: "#3e6b55"},
      "Theo Banks": {skin: 5, hair: "short", hairColor: "black", clothes: "#9a7420"}
    },
    parties: {
      plaintiff: { label: "The State", lawyer: "Prosecutor Allen Cho" },
      defense: { label: "Marcus Bell", lawyer: "Public defender Gloria Estes" }
    },
    cards: {
      "face-to-face": { title: "Nadia was three feet from the robber under bright lights", dir: 1, power: 2, tags: ["witness"] },
      "picked-lineup": { title: "Nadia picked Marcus out of six photos", dir: 1, power: 3, tags: ["witness"], rebuts: ["two-minutes"], replies: { tasha: { unmoved: "She picked the guy the detective already liked." }, dev: { moved: "She picked him out of six. Luck alone would be one in six." } } },
      "certain-now": { title: "Nadia says she's certain today", dir: 1, power: 1, tags: ["witness", "character"] },
      "two-minutes": { title: "The robbery lasted under two minutes, hood up", dir: -1, power: 2, tags: ["witness", "timeline"], rebuts: ["face-to-face"] },
      "knife-focus": { title: "Nadia was watching the knife", dir: -1, power: 2, tags: ["witness"], rebuts: ["face-to-face"] },
      "pretty-sure": { title: "At the lineup, Nadia only said 'pretty sure'", dir: -1, power: 3, tags: ["witness", "procedure"], rebuts: ["certain-now", "picked-lineup"], replies: { carla: { moved: "Pretty sure. That's not the same as certain, is it." }, hank: { unmoved: "Pretty sure, certain. Same thing to me." } } },
      "feedback": { title: "The detective told her, 'Good. That's who we thought.'", dir: -1, power: 3, tags: ["procedure"], rebuts: ["picked-lineup"], replies: { ruth: { moved: "The detective shouldn't have said that. It taints everything after." }, hank: { unmoved: "So he said good job. So what?" } } },
      "anon-tip": { title: "An anonymous tip named Marcus", dir: 1, power: 2, tags: ["procedure"], struck: true },
      "clean-shaven": { title: "That night, Nadia described the robber as clean-shaven", dir: -1, power: 1, tags: ["witness"] },
      "no-hoodie-claim": { title: "Marcus told police he didn't own a gray hoodie", dir: -1, power: 1, tags: ["character"] },
      "matches": { title: "Marcus matches the description and lives eight blocks away", dir: 1, power: 1, tags: ["timeline"] },
      "hoodie": { title: "A gray hoodie was found in Marcus's closet", dir: 1, power: 2, tags: ["physical"] },
      "not-blind": { title: "The lineup wasn't blind: the detective knew the suspect", dir: -1, power: 2, tags: ["procedure"] },
      "plain-hoodie": { title: "The hoodie is a plain one sold everywhere", dir: -1, power: 1, tags: ["physical"], rebuts: ["hoodie"] },
      "no-physical": { title: "No face on video, no prints, no knife, no cash", dir: -1, power: 3, tags: ["physical"], rebuts: ["matches", "hoodie"], replies: { hank: { moved: "No prints, no knife, no money. That's a lot of nothing." }, ruth: { moved: "The State has the burden. That's a lot missing." } } },
      "misid-common": { title: "Mistaken IDs are common in overturned convictions", dir: -1, power: 2, tags: ["expert"] },
      "confidence-grows": { title: "Confidence grows after a detective's approval", dir: -1, power: 3, tags: ["expert", "procedure"], rebuts: ["certain-now"] },
      "many-right": { title: "The memory expert agrees many eyewitnesses are right", dir: 1, power: 1, tags: ["expert"], rebuts: ["misid-common"] },
      "gym-checkin": { title: "Marcus checked into a gym 15 minutes away at 9:21", dir: -1, power: 1, tags: ["timeline", "records"] },
      "gym-gap": { title: "The gym doesn't track exits. He had time to get to the store", dir: 1, power: 2, tags: ["timeline", "records"], rebuts: ["gym-checkin"] },
      "side-door": { title: "The gym has an unalarmed side exit", dir: 1, power: 2, tags: ["timeline", "physical"], rebuts: ["gym-checkin", "regular"] },
      "no-footage": { title: "Police never asked for the gym's door video", dir: -1, power: 2, tags: ["procedure"] },
      "regular": { title: "Marcus checked in at that time most weeknights", dir: -1, power: 1, tags: ["records", "character"] }
    },
    steps: [
      {
        type: "judge",
        speaker: "Judge Raymond Ostrowski",
        text: [
          "Members of the jury, welcome. The defendant, Marcus Bell, is charged with robbing the Quik Stop on Fulton Avenue at knifepoint on February 11.",
          "Mr. Bell has pleaded not guilty and is presumed innocent.",
          "The main question here is identification: has the State proven that Mr. Bell is the person who did it?",
          "Pay close attention to how each witness knows what they say they know."
        ]
      },
      {
        type: "opening",
        side: "plaintiff",
        speaker: "Prosecutor Allen Cho",
        text: [
          "At 9:42 p.m. on February 11, a man in a gray hoodie walked into the Quik Stop, pulled a knife, and made the clerk empty the register.",
          "That clerk, Nadia Petrov, stood face to face with him. Three days later she picked Marcus Bell out of a photo lineup. Today she'll tell you she's certain.",
          "Police found a gray hoodie in his apartment, just like the one on the store's camera.",
          "She saw him. She picked him. She's sure."
        ]
      },
      {
        type: "opening",
        side: "defense",
        speaker: "Public defender Gloria Estes",
        text: [
          "Nobody doubts Nadia Petrov was robbed, or that she believes what she'll tell you.",
          "But the robbery took less than two minutes, the man's hood was up, and Nadia spent most of it staring at a knife.",
          "When she picked Marcus, she said she was 'pretty sure.' The detective told her she'd picked the right man. Her certainty came later.",
          "Good people can be honestly wrong. The question is whether you can be sure."
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Nadia Petrov",
        role: "Store clerk, the victim",
        direct: [
          { q: "Ms. Petrov, tell us what happened.", a: "A man came in with his hood up, pulled out a knife and said, 'Open it. Now.' I gave him everything in the register. About $340. He ran out.", expression: "sad" },
          { q: "How close was he? Could you see his face?", a: "Across the counter. Maybe three feet. The lights in the store are very bright.", card: "face-to-face" },
          { q: "Three days later, did a detective show you photographs?", a: "Yes. Six photos. I picked number four. Him.", card: "picked-lineup" },
          { q: "How sure are you today?", a: "I'm certain. I will never forget his face.", card: "certain-now" }
        ],
        cross: [
          { q: "When police first asked you that night, how did you describe him?", a: "Medium height, maybe 25. Clean-shaven, I think. It all happened so fast.", card: "clean-shaven" },
          { q: "How long was the man in the store, with his hood up?", a: "A minute and a half. Two minutes. His hood was up the whole time.", card: "two-minutes" },
          { q: "During that time, where were your eyes?", a: "On him. And on the knife, I guess. I was scared he'd use it.", card: "knife-focus" },
          { q: "When you picked photo four, what exactly did you say?", a: "I think I said, 'I'm pretty sure it's him.'", card: "pretty-sure" },
          { q: "And what did the detective say back?", a: "He said, 'Good. That's who we thought.' After that I felt more sure.", card: "feedback", expression: "surprised", sfx: "murmur", react: [{ juror: "ruth", word: "Oh dear.", expression: "sad" }] }
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Detective Frank Gilroy",
        role: "Ran the photo lineup",
        direct: [
          { q: "Detective, how did Marcus Bell become a suspect?", a: "An anonymous tip came in the next day naming him.", card: "anon-tip" },
          { objection: "Hearsay", by: "defense", ruling: "Overruled", note: "The judge let the tip in only to explain why police looked at Mr. Bell. The jury may NOT treat it as proof he did it, because whoever called can't be questioned. Using it as proof breaks the judge's rule." },
          { q: "What else made him a suspect?", a: "He matched the clerk's description, and he lives about eight blocks from the store.", card: "matches" },
          { q: "When you questioned Mr. Bell, did he say anything about a gray hoodie?", a: "He said he didn't own one.", card: "no-hoodie-claim" },
          { q: "What did the search of his apartment turn up?", a: "A gray hooded sweatshirt, consistent with the one on the store video.", card: "hoodie", show: "State's Exhibit 3", mark: "hoodie-found" },
          { q: "Did the store camera capture the robber's face?", a: "No. It's above and behind the counter. It shows the back of the hood and a hand holding a knife.", show: "State's Exhibit 4" }
        ],
        cross: [
          { q: "When you showed Ms. Petrov the photos, did you know which one was Marcus?", a: "Yes. I put the lineup together." },
          { q: "Some departments use 'blind' lineups, where the officer doesn't know who the suspect is, so they can't give hints. This wasn't one?", a: "No, it wasn't.", card: "not-blind" },
          { q: "Does Mr. Bell have a beard?", a: "Yes, a short beard. He had it when we arrested him three days after the robbery.", mark: "beard" },
          { q: "Is there anything unique about that hoodie?", a: "No. It's a plain gray hoodie from a big department store.", card: "plain-hoodie" },
          { q: "Fingerprints? The knife? The cash?", a: "The counter was wiped before we could check for prints. No knife or cash was found at his apartment.", card: "no-physical", sfx: "murmur" }
        ],
        exhibits: [
          {
            label: "State's Exhibit 3",
            title: "Gray hooded sweatshirt",
            body: "Plain gray pullover hoodie, men's size L.\nNo logos. Sold at most department stores.\nRecovered from Marcus Bell's closet, Feb 15."
          },
          {
            label: "State's Exhibit 4",
            title: "Store camera still, 9:42 p.m.",
            body: "High angle, behind the counter.\nShows: back of a gray hood, a right hand\nholding a folding knife. Face not visible."
          }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Dr. Simone Laurent",
        role: "Psychologist, memory expert",
        intro: "Another expert witness. She isn't saying whether Nadia is right or wrong. She's explaining what research says about eyewitness memory.",
        direct: [
          { q: "Dr. Laurent, how reliable is eyewitness identification?", a: "It can be accurate, but it's less reliable than people assume. Mistaken eyewitness IDs played a role in a large share of convictions later overturned by DNA.", card: "misid-common" },
          { q: "What makes a mistake more likely?", a: "A short, stressful event. A weapon, because people stare at it. A hood or disguise. And identifying a total stranger." },
          { q: "Ms. Petrov says she's certain.", a: "Confidence often grows after positive feedback, like 'Good, that's who we thought.' The confidence that matters most is the first one, at the lineup. Here, that was 'pretty sure.'", card: "confidence-grows" }
        ],
        cross: [
          { q: "Doctor, you can't say her identification is wrong.", a: "Correct. I can only say which factors make errors more likely." },
          { q: "Plenty of eyewitnesses are right, aren't they?", a: "Yes, many are.", card: "many-right" }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Theo Banks",
        role: "Gym front desk manager",
        direct: [
          { q: "Mr. Banks, what do your records show for February 11?", a: "Marcus Bell scanned his membership card at 9:21 p.m.", card: "gym-checkin", show: "Defense Exhibit A" },
          { q: "How far is your gym from the Quik Stop?", a: "About fifteen minutes by car. Maybe ten if you're speeding." }
        ],
        cross: [
          { q: "Does your system record when people leave?", a: "No. Only when they come in." },
          { q: "So he could have scanned in at 9:21, walked right back out, and reached the Quik Stop by 9:42.", a: "If he left right away, I guess he could.", card: "gym-gap" },
          { q: "Do you personally remember seeing him that night?", a: "No. It's a busy gym." }
        ],
        jurorQuestion: [
          { q: "Does the gym have any other exits?", a: "There's an emergency exit by the locker rooms. It isn't alarmed. People use it to get to the side lot.", card: "side-door" },
          { q: "Do you have video of people leaving?", a: "There's a camera on the front door. Police never asked for it, and it records over after 30 days.", card: "no-footage" },
          { q: "Did Marcus usually come in around that time?", a: "His card shows him checking in between 9 and 9:30 most weeknights.", card: "regular" }
        ],
        exhibits: [
          {
            label: "Defense Exhibit A",
            title: "Ironside Gym check-in log",
            body: "Feb 11  21:21:07  BELL, MARCUS  #40917  ENTRY\n(The system does not record exits.)"
          }
        ]
      },
      {
        type: "closing",
        side: "plaintiff",
        speaker: "Prosecutor Allen Cho",
        text: [
          "Nadia Petrov stood three feet from this man under bright lights. She picked Marcus Bell out of six photos, and she's certain.",
          "He matches her description, lives eight blocks away, owns a hoodie like the robber's, and his alibi leaves him plenty of time.",
          "Experts talk about memory in general. Nadia was there. Find him guilty."
        ]
      },
      {
        type: "closing",
        side: "defense",
        speaker: "Public defender Gloria Estes",
        text: [
          "This case is one two-minute memory of a stranger in a hood, behind a knife.",
          "No face on video. No prints. No knife. No cash. A hoodie half the city owns.",
          "Nadia was 'pretty sure' until a detective told her she'd picked the right man.",
          "Could Marcus have rushed from the gym and robbed a store? Maybe. 'Maybe' is not proof beyond a reasonable doubt."
        ]
      },
      {
        type: "instructions",
        speaker: "Judge Raymond Ostrowski",
        text: [
          "To find Mr. Bell guilty, you must all agree the State proved beyond a reasonable doubt that someone robbed the Quik Stop with a knife, and that Marcus Bell is that person.",
          "When weighing the identification, consider how long the witness saw the person, the lighting and distance, any disguise, stress, whether a weapon was present, how the lineup was done, and how certain the witness was at the time of the lineup.",
          "Remember: you may consider the anonymous tip only as the reason police investigated Mr. Bell, not as evidence that he did it.",
          "If you think there's a real possibility Mr. Bell is not the robber, you must find him not guilty. Your verdict must be unanimous."
        ]
      }
    ],
    contradictions: [
      {
        id: "c-beard", line: "beard", conflictsWith: "clean-shaven",
        bonus: { title: "Nadia described a clean-shaven man, but Marcus had a beard", dir: -1, power: 3, tags: ["witness", "physical"], rebuts: ["matches","picked-lineup"] },
        explain: "Marcus had a short beard when he was arrested three days after the robbery. You can't grow one in three days. Either Nadia's first description was wrong, or the robber wasn't Marcus."
      },
      {
        id: "c-hoodie", line: "hoodie-found", conflictsWith: "no-hoodie-claim",
        bonus: { title: "Marcus said he didn't own a gray hoodie, but police found one in his closet", dir: 1, power: 3, tags: ["physical", "character"], rebuts: ["plain-hoodie"] },
        explain: "Lying to police about the hoodie doesn't prove he robbed the store. But jurors may weigh a lie like that as a sign of a guilty conscience."
      }
    ],
    jury: {
      start: { ruth: 58, dev: 55, carla: 78, hank: 84, tasha: 24 },
      takes: {
        ruth: "The judge gave us a list of things to weigh about the identification. I think we should actually go through it.",
        dev: "The gym timeline is tight but possible. I can't rule him in or out on that alone.",
        carla: "That poor woman. She looked right at him. I believe her.",
        hank: "Victim picks him out, he's got the hoodie, lives around the corner. What more do you want?",
        tasha: "That lineup was a mess. The detective basically told her she got it right."
      },
      points: [
        { dir: 1, text: "She was right there. Three feet away. You don't forget a face like that." },
        { dir: -1, text: "She said 'pretty sure' until the detective patted her on the back." },
        { dir: 1, text: "Checking into a gym twenty minutes before? Sounds like setting up an alibi." },
        { dir: -1, text: "Take away her ID and there's nothing. No prints, no knife, no money." },
        { dir: 1, text: "Somebody called in his name. Where there's smoke there's fire.", struck: true },
        { dir: -1, text: "A hood, a knife, two minutes. I'd be lucky to remember the guy's shoes." }
      ]
    },
    truth: {
      actual: "guilty",
      lawful: "not-guilty",
      headline: "Marcus actually did it.",
      story: "Marcus Bell did rob the Quik Stop. He scanned into the gym, slipped out the side door, and drove to the store. Two years later he was caught robbing another store, and his knife was linked to the Quik Stop robbery. But none of that was known at this trial. He lied about the hoodie because he knew it looked bad, and his beard was real: Nadia's first description was simply wrong, which is exactly how eyewitness memory can fail.",
      lesson: "If your jury found him not guilty, you may have done exactly what the law asks. 'Not guilty' doesn't mean innocent. It means the State didn't prove its case beyond a reasonable doubt. Juries decide on the evidence in front of them. The system accepts that some guilty people go free so that fewer innocent people are convicted."
    }
  }
];
