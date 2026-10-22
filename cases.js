// All cases are made up. Some borrow the general shape of common real-world
// case types, but every name, place, and fact here is invented.
//
// To add a case, copy one of the objects below and change it. Step types:
//   judge        - the judge talks to the jury
//   opening      - a lawyer's opening statement (side: "prosecution" | "plaintiff" | "defense")
//   witness      - testimony: direct examination, then cross-examination
//   closing      - a lawyer's closing argument
//   instructions - the judge explains the law the jury must apply
// Transcript lines are { q, a } pairs, or an objection:
//   { objection: "Hearsay", by: "defense", ruling: "Sustained", note: "..." }

window.CASES = [
  {
    id: "night-deposit",
    title: "The Night Deposit",
    caption: "State v. Dana Whitlock",
    docket: "CR-2026-0412",
    kind: "criminal",
    charge: "Theft of more than $1,000 from an employer",
    blurb: "Over three weeks, $4,200 vanished from a small bakery's bank deposits. The assistant manager closed on most of those nights.",
    length: "About 30 minutes",
    parties: {
      plaintiff: { label: "The State", lawyer: "Prosecutor Renee Okafor" },
      defense: { label: "Dana Whitlock", lawyer: "Defense attorney Sam Pruitt" }
    },
    steps: [
      {
        type: "judge",
        speaker: "Judge Harriet Vance",
        text: [
          "Good morning, members of the jury. Thank you for being here.",
          "The defendant, Dana Whitlock, is charged with stealing more than $1,000 from her employer, Crumb & Co. Bakery. She has pleaded not guilty.",
          "The charge is only an accusation. It is not evidence. Ms. Whitlock is presumed innocent, and that presumption stays with her unless the State proves her guilty beyond a reasonable doubt.",
          "Listen carefully, keep an open mind, and do not decide anything until you have heard everything and talked it over together."
        ]
      },
      {
        type: "opening",
        side: "plaintiff",
        speaker: "Prosecutor Renee Okafor",
        text: [
          "Crumb & Co. is a six-person bakery. Every night, whoever closes counts the cash, writes the total on a deposit slip, and seals it in a bag for the bank.",
          "On nine nights this spring, the bank opened that bag and found less money than the slip said. $4,200 in all.",
          "Dana Whitlock closed on seven of those nine nights. During those same three weeks, she was behind on rent. And during those same three weeks, she paid $3,800 in cash for a used car.",
          "You will hear from the owner, from the bank, and from the detective. When you put the pieces together, they point to one person."
        ]
      },
      {
        type: "opening",
        side: "defense",
        speaker: "Defense attorney Sam Pruitt",
        text: [
          "Dana has worked at Crumb & Co. for four years. She was trusted with the keys from her second month.",
          "The State is going to show you a pattern. What they will not show you is anyone seeing Dana take a single dollar.",
          "You will learn that Dana did something the other closers did not: she locked the bag in the office safe overnight and dropped it at the bank the next morning. That means the bag sat in that safe for hours, and Dana was not the only person who could open it.",
          "And the car money? You will see where it came from. Listen for what the State cannot explain."
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Marty Feld",
        role: "Owner of Crumb & Co. Bakery",
        direct: [
          { q: "Mr. Feld, how did you find out money was missing?", a: "The bank called me. They said our deposits were coming up short. A couple hundred here, six hundred there." },
          { q: "How is a deposit supposed to work at your bakery?", a: "The closer counts the drawer, fills out the slip, zips the cash and slip into the bank bag. Then it goes to the bank's night drop." },
          { q: "Did everyone follow that routine?", a: "Mostly. Dana liked to put the bag in the office safe and take it to the bank on her way in the next morning. She said the night drop was on a dark street and she didn't feel safe there." },
          { q: "Did you allow that?", a: "I did. I didn't think anything of it." },
          { q: "I'm showing you what's been marked State's Exhibit 1. What is it?", a: "That's the list of short deposits the bank sent me, with who closed each night. Dana's name is on seven of the nine." }
        ],
        cross: [
          { q: "Mr. Feld, the bags you use. Are they the tamper-evident kind, the ones that show if they've been opened?", a: "No. They're plain zipper bags. The tamper-proof ones cost more." },
          { q: "Who knows the combination to the office safe?", a: "Me, Dana, and my nephew Kyle." },
          { q: "What does Kyle do at the bakery?", a: "He's our early baker. He comes in around four in the morning to start the bread." },
          { q: "Alone?", a: "Usually, yes. Until about seven." },
          { q: "So on the nights Dana put the bag in the safe, Kyle was alone in the building with that safe for about three hours before Dana arrived?", a: "I suppose so. But Kyle is family." },
          { q: "The two short nights that were not Dana's. Who closed those?", a: "Kyle covered those two shifts." },
          { q: "Did Kyle use the safe on those nights?", a: "I don't know. I wasn't there." }
        ],
        exhibits: [
          {
            label: "State's Exhibit 1",
            title: "Bank shortage report",
            body: "9 short deposits between April 3 and April 24.\nTotal missing: $4,200.\nClosed by D. Whitlock: 7 nights ($3,550).\nClosed by K. Feld: 2 nights ($650)."
          }
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Detective Luis Arroyo",
        role: "Investigating officer",
        direct: [
          { q: "Detective, what did you learn about Ms. Whitlock's finances?", a: "Her landlord told me she was two months behind on rent in March." },
          { objection: "Hearsay", by: "defense", ruling: "Sustained", note: "Hearsay is when a witness repeats what someone else said outside of court to prove it's true. The landlord isn't here to be questioned, so the judge tells the jury to ignore that answer." },
          { q: "Let me ask it differently. What did you find on Ms. Whitlock's phone, with a warrant?", a: "A text she sent her sister on April 2. It said, 'If I don't come up with rent this month I'm done. I don't know what to do.'" },
          { q: "And did you find any large purchases?", a: "Yes. On April 20 she bought a 2014 sedan from a private seller for $3,800, paid in cash." },
          { q: "Was there any camera footage?", a: "The bakery has one camera over the front register. It shows Ms. Whitlock carrying the bank bag out the door on each of her closing nights." }
        ],
        cross: [
          { q: "Detective, the camera over the register. Does it show the office, where the safe is?", a: "No." },
          { q: "Does any video show Ms. Whitlock opening a bag, or taking cash out of anything?", a: "No." },
          { q: "Carrying the bank bag out the door. That's her job, isn't it?", a: "Yes." },
          { q: "Did you look at Ms. Whitlock's bank account?", a: "I did." },
          { q: "I'm showing you Defense Exhibit A. What does it show on April 15?", a: "A tax refund deposit of $3,100. And a withdrawal of $3,100 in cash on April 19." },
          { q: "The day before she bought the car.", a: "Yes." },
          { q: "Did you ever interview Kyle Feld?", a: "Briefly. He said he didn't know anything about it." },
          { q: "Did you check Kyle Feld's finances? His phone? His purchases?", a: "No. He wasn't a suspect." }
        ],
        exhibits: [
          {
            label: "State's Exhibit 2",
            title: "Text message, April 2",
            body: "From Dana to her sister:\n\"If I don't come up with rent this month I'm done. I don't know what to do.\""
          },
          {
            label: "Defense Exhibit A",
            title: "Dana Whitlock's bank statement",
            body: "Apr 15  IRS TREAS 310 TAX REF   +$3,100.00\nApr 19  CASH WITHDRAWAL            -$3,100.00\nApr 20  (Car purchased for $3,800 cash)"
          }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Dana Whitlock",
        role: "The defendant",
        intro: "A defendant never has to testify, and the jury may not hold it against them if they don't. Dana has chosen to testify.",
        direct: [
          { q: "Dana, did you take any money from Crumb & Co.?", a: "No. Never." },
          { q: "Why did you keep the bag in the safe overnight?", a: "The bank's night drop is in an alley with no lights. A guy followed me there once in January. After that I started dropping it in the morning instead. Marty said that was fine." },
          { q: "Where did the money for the car come from?", a: "My tax refund was $3,100. I'd saved about $700 more in cash at home. My old car died and I needed to get to work." },
          { q: "What about that text to your sister?", a: "I was scared. I was behind on rent. I'm not going to pretend I wasn't. But being broke doesn't make me a thief." }
        ],
        cross: [
          { q: "You were desperate for money in April, weren't you?", a: "I was worried about money. Yes." },
          { q: "And seven of the nine short nights were your nights.", a: "They were nights the bag sat in the safe. That's not the same thing." },
          { q: "The $700 you say you had at home. Do you have any record of that?", a: "No. It was cash in a coffee can." },
          { q: "You counted the money and wrote the slips yourself on those nights, correct?", a: "Yes. And the slips were right. I counted twice." },
          { q: "Did you ever see Kyle Feld take anything?", a: "No. I never saw him take anything." }
        ]
      },
      {
        type: "closing",
        side: "plaintiff",
        speaker: "Prosecutor Renee Okafor",
        text: [
          "Seven of nine nights. A desperate text about rent. A cash car purchase in the middle of it all.",
          "The defense wants you to blame someone who isn't on trial. But the shortages followed Dana Whitlock. When she closed, money disappeared.",
          "And that $700 in a coffee can? There is no record of it. Use your common sense. The State asks you to return a verdict of guilty."
        ]
      },
      {
        type: "closing",
        side: "defense",
        speaker: "Defense attorney Sam Pruitt",
        text: [
          "The shortages didn't follow Dana. They followed the safe. On Dana's nights, the bag sat in that safe for hours, in a building where one other person knew the combination and was there alone every morning.",
          "And the other two short nights? Kyle closed them. Not Dana.",
          "Nobody saw Dana take money. The car was paid for with her tax refund. The detective never looked at anyone else.",
          "Maybe you think Dana could have done it. That's not enough. If you have a reasonable doubt, the law says your verdict must be not guilty."
        ]
      },
      {
        type: "instructions",
        speaker: "Judge Harriet Vance",
        text: [
          "To find Ms. Whitlock guilty, you must all agree that the State proved each of these beyond a reasonable doubt:",
          "1. Money was taken from Crumb & Co. without permission.",
          "2. Dana Whitlock is the person who took it.",
          "3. The amount taken was more than $1,000.",
          "A reasonable doubt is a doubt based on reason and common sense. It is not a fanciful or imaginary doubt. Proof beyond a reasonable doubt is proof that leaves you firmly convinced.",
          "Evidence can be direct, like a witness who saw something happen, or circumstantial, meaning facts that let you infer something else. Both kinds count. You decide how much weight to give each piece.",
          "Ms. Whitlock's lawyer pointed to another person. Ms. Whitlock does not have to prove someone else did it. The State has to prove that she did."
        ]
      }
    ],
    questions: [
      "Do the seven nights prove Dana took the money, or only that the bag sat in the safe on those nights?",
      "Does the tax refund explain the car? Does the missing record for the $700 matter?",
      "How much should the rent text count? Plenty of people are behind on rent.",
      "Is it a problem that the detective never investigated Kyle?",
      "Are you firmly convinced, or do you just think she probably did it?"
    ],
    truth: {
      actual: "not-guilty",
      headline: "Dana didn't do it.",
      story: "Kyle Feld had been taking a few hundred dollars from the bag on mornings he was alone with the safe. He owed money from sports betting. He also skimmed on the two nights he closed. Six months later, Marty finally bought tamper-evident bags and a camera for the office, and the shortages stopped. Kyle eventually confessed.",
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
    length: "About 25 minutes",
    parties: {
      plaintiff: { label: "Joan Hollis", lawyer: "Attorney Priya Natarajan" },
      defense: { label: "Gary Brandt", lawyer: "Attorney Tom Reyes" }
    },
    steps: [
      {
        type: "judge",
        speaker: "Judge Elena Moreau",
        text: [
          "Welcome, members of the jury. This is a civil case, not a criminal one. Nobody is accused of a crime and nobody is going to jail.",
          "The plaintiff, Joan Hollis, says her neighbor, Gary Brandt, was careless in not dealing with a dying oak tree, and that the tree fell on her garage and car. She asks for $14,500 to cover the damage.",
          "Mr. Brandt says he did what a reasonable homeowner would do, and that a severe storm knocked the tree down.",
          "In a civil case, the plaintiff has to prove her case by a preponderance of the evidence. I'll explain exactly what that means at the end."
        ]
      },
      {
        type: "opening",
        side: "plaintiff",
        speaker: "Attorney Priya Natarajan",
        text: [
          "For two years, Joan Hollis watched the big oak in her neighbor's yard lean further toward her garage. Dead branches dropped onto her driveway. Mushrooms grew at its base.",
          "Eight months before it fell, she wrote Mr. Brandt a letter asking him to have it checked. You'll see that letter.",
          "Mr. Brandt never hired a certified arborist. He asked his brother-in-law, a landscaper, to take a look from the sidewalk.",
          "Storms happen. Healthy trees usually survive them. This tree was rotten inside, and a careful owner would have known it."
        ]
      },
      {
        type: "opening",
        side: "defense",
        speaker: "Attorney Tom Reyes",
        text: [
          "On the night of June 9, a storm hit this town with wind gusts over 60 miles an hour. It knocked down dozens of trees, including plenty of healthy ones.",
          "When Gary got Ms. Hollis's letter, he didn't ignore it. He had someone with twenty years of experience working with trees come out and look. That person said the tree was fine.",
          "Gary is not a tree expert. He did what most of us would do. The law doesn't make homeowners pay for acts of nature."
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Joan Hollis",
        role: "The plaintiff, next-door neighbor",
        direct: [
          { q: "Ms. Hollis, what did you notice about the oak before it fell?", a: "It was leaning more every year toward my garage. Big dead branches would fall onto my driveway. One cracked my windshield in 2025. And there were these big shelf mushrooms growing at the bottom of the trunk." },
          { q: "What did you do about it?", a: "I talked to Gary twice. Then I wrote him a letter, because I wanted it on paper." },
          { q: "Is this the letter, Plaintiff's Exhibit 1?", a: "Yes. I put it in his mailbox in October." },
          { q: "What happened on June 9?", a: "Around 11 at night there was a huge crack, then a crash. The oak split near the bottom and fell right across my garage. It crushed the roof and my car inside." }
        ],
        cross: [
          { q: "Ms. Hollis, you're not a tree expert, are you?", a: "No." },
          { q: "You don't know whether those mushrooms meant anything, do you? You just didn't like how they looked.", a: "I looked it up online. It said they can mean the tree is rotting." },
          { q: "Other trees came down in that storm, didn't they? Including on your street?", a: "Yes. A maple came down two houses over." },
          { q: "And your homeowner's insurance has already paid part of your loss?", a: "Some of it. Not all." }
        ],
        exhibits: [
          {
            label: "Plaintiff's Exhibit 1",
            title: "Letter to Gary Brandt, October 14",
            body: "Gary,\nI'm worried about the oak by the fence. It keeps leaning toward my garage and branches keep falling. There are mushrooms growing at the base. Could you please have a tree expert look at it before winter? I'm happy to split the cost of an inspection.\nThanks, Joan"
          }
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Dr. Wendell Achebe",
        role: "Certified arborist, expert witness",
        intro: "An expert witness is allowed to give opinions about their specialty. Ordinary witnesses can only say what they saw or heard. The jury doesn't have to accept an expert's opinion.",
        direct: [
          { q: "Dr. Achebe, what did you examine?", a: "The stump and the fallen trunk, about a week after the storm. I took cross-sections and photographs." },
          { q: "What did you find?", a: "Advanced heart rot. About 70 percent of the trunk's interior at the break point was decayed. The mushrooms Ms. Hollis described are the fruiting bodies of a rot fungus. They're a classic warning sign." },
          { q: "Would a certified arborist have noticed that before the storm?", a: "Almost certainly. The fungus, the lean, and the dead limbs together are textbook signs. A simple test with a resistance drill would have confirmed the rot in about ten minutes." },
          { q: "Would a healthy oak of that size have survived the storm?", a: "In my opinion, more likely than not, yes. Gusts of 60 miles an hour do bring down healthy trees sometimes. But a trunk that's 70 percent hollow has very little strength left." }
        ],
        cross: [
          { q: "Doctor, you're being paid for your time here?", a: "Yes, my standard rate of $250 an hour, regardless of what I conclude." },
          { q: "You never saw the tree while it was standing.", a: "Correct." },
          { q: "You agree that healthy trees fell in this storm?", a: "Some did, yes." },
          { q: "So you can't say for certain this tree would have survived.", a: "Not for certain. I can say it's more likely than not." }
        ],
        exhibits: [
          {
            label: "Plaintiff's Exhibit 2",
            title: "Arborist's report (summary)",
            body: "Species: Red oak, approx. 80 years old\nFailure point: 3 ft above ground\nInterior decay at failure point: approx. 70%\nVisible warning signs: fungal conks at base, 12° lean, dead limbs in crown\nOpinion: Defect detectable by visual inspection by a qualified arborist."
          }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Gary Brandt",
        role: "The defendant, homeowner",
        direct: [
          { q: "Mr. Brandt, what did you do when you got Ms. Hollis's letter?", a: "I called my brother-in-law, Rick. He's run a landscaping business for twenty years and he takes down trees all the time. He came over and looked at it." },
          { q: "What did he tell you?", a: "He said oaks lean, the mushrooms were just from the mulch, and the tree had years left in it." },
          { q: "Did you believe him?", a: "Of course. He knows a lot more about trees than I do." },
          { q: "How did you feel when the tree fell?", a: "Terrible. I went right over to make sure Joan was okay." }
        ],
        cross: [
          { q: "Mr. Brandt, Rick is not a certified arborist, is he?", a: "He's not certified. But he's experienced." },
          { q: "Did Rick go into your yard, touch the tree, or test the trunk?", a: "He looked at it from the sidewalk and from my driveway." },
          { q: "How long was he there?", a: "Maybe ten minutes. He was dropping off a ladder anyway." },
          { q: "Ms. Hollis offered to split the cost of a real inspection. Did you take her up on that?", a: "No. Rick already said it was fine." },
          { q: "Did you write back to her?", a: "No. I told her in person it was fine." },
          { q: "Rick isn't here today, is he?", a: "He's working." }
        ]
      },
      {
        type: "closing",
        side: "plaintiff",
        speaker: "Attorney Priya Natarajan",
        text: [
          "Mr. Brandt was warned, in writing, with specific signs. He got a ten-minute look from the sidewalk by a relative who's not an arborist and who isn't here to answer questions.",
          "Dr. Achebe told you the rot was there to see, and that a healthy tree would more likely than not have survived.",
          "We don't have to prove anything beyond a reasonable doubt. We only have to show that it's more likely than not that Mr. Brandt was careless and that his carelessness caused this. We have done that."
        ]
      },
      {
        type: "closing",
        side: "defense",
        speaker: "Attorney Tom Reyes",
        text: [
          "Gary did not ignore his neighbor. He asked someone with decades of experience. Most people never do even that.",
          "The plaintiff's own expert admits he can't say for sure the tree would have survived. Healthy trees fell that night, including a maple on the same street.",
          "Accidents happen. A storm is no one's fault. We ask you to find that Gary Brandt is not responsible."
        ]
      },
      {
        type: "instructions",
        speaker: "Judge Elena Moreau",
        text: [
          "To find Mr. Brandt liable, you must find that Ms. Hollis proved each of these by a preponderance of the evidence:",
          "1. Mr. Brandt knew, or reasonably should have known, that the tree was dangerous.",
          "2. He failed to act as a reasonably careful homeowner would.",
          "3. That failure was a substantial cause of the damage.",
          "A preponderance of the evidence means more likely than not. Picture a balance scale. If the evidence tips it even slightly toward Ms. Hollis, she has met her burden. If it's even, or tips toward Mr. Brandt, she has not.",
          "This is a lower standard than in a criminal case. You do not need to be firmly convinced.",
          "In this civil case, you do not all have to agree. At least three out of every four of you must agree on the verdict."
        ]
      }
    ],
    questions: [
      "After Joan's letter, should Gary have known the tree might be dangerous?",
      "Was a ten-minute look by an uncertified relative enough, or would a careful homeowner do more?",
      "Did the rot cause the fall, or the storm? Could it be both?",
      "Does it matter that Rick didn't come to court?",
      "Remember the balance scale. Which way does it tip, even a little?"
    ],
    truth: {
      actual: "liable",
      headline: "The rot was the real cause.",
      story: "Rick never walked into the yard. He'd glanced at the tree while dropping off a ladder and told Gary what he wanted to hear. A certified arborist would have spotted the conks and recommended removal, which would have cost about $2,800. The maple two houses over was the only other tree on the street that fell, and it was also badly decayed.",
      lesson: "Civil cases use a much lower bar than criminal cases. You don't have to be sure. You only have to decide which side is more likely right. A storm can be the trigger and someone can still be responsible for the damage."
    }
  },

  {
    id: "corner-store",
    title: "Two Minutes at the Counter",
    caption: "State v. Marcus Bell",
    docket: "CR-2026-0788",
    kind: "criminal",
    charge: "Armed robbery of a convenience store",
    blurb: "A clerk picked a man out of a lineup after a fast, frightening robbery. Is that enough to convict him?",
    length: "About 30 minutes",
    parties: {
      plaintiff: { label: "The State", lawyer: "Prosecutor Allen Cho" },
      defense: { label: "Marcus Bell", lawyer: "Public defender Gloria Estes" }
    },
    steps: [
      {
        type: "judge",
        speaker: "Judge Raymond Ostrowski",
        text: [
          "Members of the jury, welcome. The defendant, Marcus Bell, is charged with robbing the Quik Stop on Fulton Avenue at knifepoint on the night of February 11.",
          "Mr. Bell has pleaded not guilty and is presumed innocent.",
          "The main question in this case is identification: whether the State has proven that Mr. Bell is the person who committed the robbery.",
          "Pay close attention to how each witness knows what they say they know."
        ]
      },
      {
        type: "opening",
        side: "plaintiff",
        speaker: "Prosecutor Allen Cho",
        text: [
          "At 9:42 p.m. on February 11, a man in a gray hoodie walked into the Quik Stop, pulled a knife, and made the clerk empty the register.",
          "That clerk, Nadia Petrov, stood face to face with him across the counter. Three days later, she picked Marcus Bell out of a photo lineup. Today she'll tell you she is certain.",
          "When police searched Mr. Bell's apartment, they found a gray hoodie just like the one on the store's camera.",
          "She saw him. She picked him. She's sure."
        ]
      },
      {
        type: "opening",
        side: "defense",
        speaker: "Public defender Gloria Estes",
        text: [
          "Nobody doubts that Nadia Petrov was robbed, or that she was terrified. Nobody doubts she believes what she's going to tell you.",
          "But you'll learn that the robbery took less than two minutes, the man's hood was up, and Nadia spent most of that time staring at a knife.",
          "You'll learn that the detective who showed her the lineup already suspected Marcus, and that when Nadia picked him, she said she was 'pretty sure.' Not certain. That came later.",
          "And you'll learn where Marcus was twenty minutes before the robbery. Good people can be honestly wrong. The question is whether you can be sure."
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Nadia Petrov",
        role: "Store clerk, the victim",
        direct: [
          { q: "Ms. Petrov, tell us what happened.", a: "A man came in with his hood up. He walked to the counter, pulled out a knife and said, 'Open it. Now.' I opened the register and gave him everything. About $340. He ran out." },
          { q: "How close was he?", a: "Across the counter. Maybe three feet." },
          { q: "Could you see his face?", a: "Yes. The lights in the store are very bright." },
          { q: "Three days later, did a detective show you photographs?", a: "Yes. Six photos. I picked number four." },
          { q: "Do you see the man who robbed you in the courtroom today?", a: "Yes. That's him, at the defense table." },
          { q: "How sure are you?", a: "I'm certain. I will never forget his face." }
        ],
        cross: [
          { q: "Ms. Petrov, how long was the man in the store?", a: "Maybe a minute and a half. Two minutes." },
          { q: "And during that time, where were your eyes?", a: "On him. And on the knife, I guess. I was scared he was going to use it." },
          { q: "His hood was up the whole time?", a: "Yes." },
          { q: "When you first spoke to police that night, how did you describe him?", a: "Black man, maybe 25, medium height, a short beard." },
          { q: "When you picked photo number four, what exactly did you say to the detective?", a: "I think I said, 'I'm pretty sure it's him.'" },
          { q: "And what did the detective say back?", a: "He said, 'Good. That's who we thought.'" },
          { q: "After that, you felt more sure?", a: "I suppose. Yes." },
          { q: "Before February 11, had you ever seen Marcus Bell?", a: "No. Never." }
        ]
      },
      {
        type: "witness",
        side: "plaintiff",
        name: "Detective Frank Gilroy",
        role: "Detective who ran the photo lineup",
        direct: [
          { q: "Detective, how did Marcus Bell become a suspect?", a: "An anonymous tip came in the next day naming him. He also matched the description and lives about eight blocks from the store." },
          { q: "What did the search of his apartment turn up?", a: "A gray hooded sweatshirt, State's Exhibit 3. It's consistent with the one on the store video." },
          { q: "Did the store's camera capture the robber's face?", a: "No. The camera is above and behind the counter. It shows the back of the hood and the man's hands." }
        ],
        cross: [
          { q: "Detective, when you showed Ms. Petrov the photos, did you know which one was Marcus?", a: "Yes. I put the lineup together." },
          { q: "Some departments use a 'blind' lineup, where the officer showing the photos doesn't know who the suspect is. Why?", a: "So the officer can't accidentally give hints." },
          { q: "This wasn't a blind lineup.", a: "No." },
          { q: "When she said 'pretty sure,' you told her, 'Good, that's who we thought'?", a: "I may have said something like that." },
          { q: "The gray hoodie. Is there a logo or anything unique about it?", a: "No. It's a plain gray hoodie from a big department store." },
          { q: "Were the robber's fingerprints found anywhere?", a: "The counter was wiped by staff before we could process it. We didn't get usable prints." },
          { q: "And the knife, the cash, were either found at Mr. Bell's apartment?", a: "No." }
        ],
        exhibits: [
          {
            label: "State's Exhibit 3",
            title: "Gray hooded sweatshirt",
            body: "Plain gray pullover hoodie, men's size L.\nNo logos. Sold at most large department stores.\nRecovered from Marcus Bell's bedroom closet, Feb 15."
          },
          {
            label: "State's Exhibit 4",
            title: "Still from store camera, 9:42 p.m.",
            body: "Camera angle: high, behind the counter.\nShows: back of a gray hood, a right hand holding a folding knife.\nFace not visible."
          }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Dr. Simone Laurent",
        role: "Psychology professor, expert on memory",
        intro: "This is another expert witness. She isn't saying whether Nadia is right or wrong. She's explaining what research says about eyewitness memory.",
        direct: [
          { q: "Dr. Laurent, how reliable is eyewitness identification?", a: "It can be accurate, but research shows it's often less reliable than people assume. Mistaken eyewitness IDs have played a role in a large share of convictions later overturned by DNA evidence." },
          { q: "What factors make a mistake more likely?", a: "A short, stressful event. A weapon, because people tend to stare at it. A disguise, like a hood. Identifying a stranger. And identifying someone of a different race than yourself, which research shows people are less accurate at." },
          { q: "What about confidence? Ms. Petrov says she's certain.", a: "Confidence often grows over time, especially after positive feedback like 'Good, that's who we thought.' The most meaningful confidence is the first one, at the lineup. Here that was 'pretty sure.'" }
        ],
        cross: [
          { q: "Doctor, you've never met Ms. Petrov.", a: "No." },
          { q: "You can't say her identification is wrong.", a: "Correct. I can only say which factors make errors more likely." },
          { q: "Plenty of eyewitnesses are right, aren't they?", a: "Yes, many are." }
        ]
      },
      {
        type: "witness",
        side: "defense",
        name: "Theo Banks",
        role: "Front desk manager at Ironside Gym",
        direct: [
          { q: "Mr. Banks, what do your gym's records show for February 11?", a: "Marcus Bell scanned his membership card at 9:21 p.m." },
          { q: "How far is your gym from the Quik Stop on Fulton?", a: "About fifteen minutes by car. Maybe ten if you're speeding." },
          { q: "Does your system record when people leave?", a: "No. Only when they come in." }
        ],
        cross: [
          { q: "So Mr. Bell could have scanned in at 9:21 and walked right back out.", a: "It's possible. We don't track that." },
          { q: "And arrived at the Quik Stop by 9:42.", a: "If he left right away, I guess he could." },
          { q: "Do you personally remember seeing him that night?", a: "No. It's a busy gym." }
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
          "Nadia Petrov stood three feet from this man under bright lights. She picked Marcus Bell out of six photos, and she's told you she's certain.",
          "He matches her description. He lives eight blocks away. He owns a hoodie like the robber's. And his so-called alibi leaves him plenty of time to get to the store.",
          "Experts can talk about memory in general. Nadia was there. The State asks you for a verdict of guilty."
        ]
      },
      {
        type: "closing",
        side: "defense",
        speaker: "Public defender Gloria Estes",
        text: [
          "This case comes down to one thing: a two-minute memory of a stranger in a hood, behind a knife.",
          "No face on video. No prints. No knife. No cash. A gray hoodie that half this city owns. A tip from someone who won't give a name.",
          "Nadia was 'pretty sure' at the lineup, until a detective told her she'd picked the right man. Her certainty today doesn't come from that night. It comes from that conversation.",
          "Marcus was checking into a gym fifteen minutes away. Could he have rushed out and robbed a store? Maybe. 'Maybe' is not proof beyond a reasonable doubt."
        ]
      },
      {
        type: "instructions",
        speaker: "Judge Raymond Ostrowski",
        text: [
          "To find Mr. Bell guilty, you must all agree that the State proved each of these beyond a reasonable doubt:",
          "1. Someone took money from the Quik Stop by threatening the clerk with a knife.",
          "2. Marcus Bell is that person.",
          "When you evaluate the identification, you may consider: how long the witness had to see the person, the lighting and distance, whether the person was disguised, how stressed the witness was, whether a weapon was present, how the lineup was conducted, and how certain the witness was at the time of the identification.",
          "Proof beyond a reasonable doubt is proof that leaves you firmly convinced. If you think there is a real possibility that Mr. Bell is not the robber, you must find him not guilty."
        ]
      }
    ],
    questions: [
      "How good a look did Nadia really get? Think about the hood, the knife, and the two minutes.",
      "Does it matter that she went from 'pretty sure' to 'certain'? What changed?",
      "What does the hoodie actually prove?",
      "Does the gym check-in help Marcus, hurt him, or neither?",
      "Take away the eyewitness. What's left?"
    ],
    truth: {
      actual: "guilty",
      headline: "Marcus actually did it.",
      story: "Marcus Bell did rob the Quik Stop. He scanned into the gym as an alibi, left through the side door, and drove to the store. Two years later he was caught robbing another store, and the knife he used was linked to the Quik Stop robbery. But nothing at this trial proved that.",
      lesson: "If your jury voted not guilty, you may still have done exactly what the law asks. A not-guilty verdict doesn't mean 'innocent.' It means the State didn't prove its case beyond a reasonable doubt. Juries decide based on the evidence in front of them, not on what really happened. The system accepts that some guilty people go free so that fewer innocent people are convicted."
    }
  }
];
