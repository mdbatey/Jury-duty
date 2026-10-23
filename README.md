# Jury Duty

A courtroom game that runs in your browser. You sit in the jury box, watch a made-up trial play out on a top-down courtroom board, take notes, and then try to persuade the rest of the jury to reach a verdict. At the end you find out what really happened. Play solo against five computer jurors, or host a game on a laptop or TV and have friends join as jurors from their phones.

**Play it here: https://mdbatey.github.io/Jury-duty/**

All cases are fictional. Some borrow the general shape of common real-world case types, but every name, place and fact is invented.

## How to play

1. Choose **Play solo** and **pick a case** from the docket. (To play with friends, see [Playing with friends](#playing-with-friends).)
2. **Watch the trial.** The trial moves along by itself; tap **Next** (or press the space bar) to skip ahead, or **Pause** to stop it. A bailiff opens court, and the judge hands each witness from one lawyer to the other. Witnesses walk to the stand, lawyers question them, and objections pop up with a plain explanation of what the judge decided. Each line types out; tap **Next** once to finish it and again to move on. Use **Text speed** at the top to pick Slow, Normal or Instant. Turn on **Sound** for a gavel, objection stings and the gallery's murmurs. It's off by default, and only the courtroom screen plays sound, never phones.
3. **Take notes.** When a witness says something important, tap **Write it down**. You have about 15 seconds before each fact disappears. Your notebook holds 7 facts. Be careful: if the judge throws out an answer and you use it later, the other jurors will trust you less. Keep an eye on the jury box too: computer jurors react to what they hear, and those reactions shape where they stand when deliberation starts.
4. **Catch contradictions.** If a witness says something that conflicts with a fact in your notebook, tap **Something's off** and pick that fact. Get it right and you earn a strong bonus fact for the jury room. You get 3 tries per trial, and each case has 2 contradictions to find, one helping each side.
5. **Ask one question.** In each case, one witness takes juror questions right after their cross-examination. You'll get a heads-up when they take the stand. The trial waits while you choose, and the answer can help either side.
6. **Deliberate.** In the jury room, each turn you play a fact from your notebook, choose who to say it to, and choose **how**: **Lay out the facts**, **Press hard** or **Ask a question**. Each juror is moved by different kinds of evidence and likes different approaches:
   - **Ruth:** procedure and records. Likes questions, dislikes being pressed.
   - **Dev:** records and timelines. Likes the facts laid out, dislikes being pressed.
   - **Carla:** motive, character and witnesses. Likes questions, dislikes being pressed.
   - **Hank:** physical evidence, and he's stubborn. Likes being pressed, dislikes questions.
   - **Tasha:** procedure and experts. Likes questions, dislikes the facts laid out.

   Jurors who disagree push back with a **counter-argument**, a real fact from the trial. Answer it on the next turn with a fact that rebuts it (your notebook marks which ones do) for a bonus, and it stops pulling the jury.
7. **Vote.** After 6 turns, or whenever you call a vote, the jury votes. Criminal cases must be unanimous. The civil case needs 5 of 6. Otherwise it's a hung jury.
8. **The reveal.** See what really happened, what the case teaches, and a report card on your jury service.

## Playing with friends

One device is the **courtroom screen** that everyone watches. Each player is a juror on their own phone. Up to six people can play, and computer jurors fill any empty seats.

1. On the laptop or TV, open the game and choose **Host a game**, then pick a case. The screen shows a 4-letter **game code**.
2. Everyone else opens the game on their phone, taps **Join a game**, and enters the code and their name. (Or open the join link shown on the courtroom screen.)
3. The first person to join is the **foreperson**. Their phone has **Start trial**, **Next**, **Back** and **Pause**. The trial moves along by itself, and the courtroom screen's space bar works too.
4. During the trial, each phone shows the current line and lets that juror write down facts, each for about 15 seconds. Each juror has their own private 7-fact notebook and one juror question; the trial waits until everyone has asked or tapped **No question**.
5. In the jury room, everyone picks a fact and who to say it to (or lets the others talk) at the same time. The courtroom screen plays the turn out. The foreperson can close a turn early and call votes.
6. Ballots are secret. The courtroom screen shows the totals, the verdict and the true story, and each phone shows that juror's own report card.

If a phone locks or reloads, it rejoins with the same seat and notebook. Closing the courtroom screen ends the game.

Phones connect directly to the courtroom screen with [PeerJS](https://peerjs.com/), using its free public service only to find each other. No accounts or servers are needed, but some school or office networks block these connections. See `docs/adr/0001-peer-to-peer-multiplayer-on-github-pages.md`.

## Running it

There's nothing to install. Open `index.html` in any modern browser.

If your browser blocks local files, run a tiny web server from this folder and open the address it prints:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page that loads everything |
| `style.css` | The look of the game, including light and dark mode |
| `cases.js` | The jurors and all trial content. Edit this to add or change cases. |
| `portraits.js` | Code-drawn character faces and their expressions |
| `sound.js` | Courtroom sound effects, generated in code |
| `engine.js` | The game's rules: seats, the trial script, notebooks, deliberation, ballots and report cards. No screen code. |
| `net.js` | The connection between the courtroom screen and phones |
| `game.js` | Every screen: home, solo play, the courtroom screen and the juror's phone |

### Testing multiplayer

- Add `?noauto` to stop the trial from moving on by itself (handy for automated tests).
- Add `?local` to the address (for example `http://localhost:8000/?local`) to connect tabs in the same browser instead of real devices. Open the host in one tab and the join link in others.
- Add `?peerhost=host:port` to use your own [PeerJS server](https://github.com/peers/peerjs-server) instead of the public one.

## Adding a case

Open `cases.js`, copy one of the cases in `window.CASES`, and change it. The comments at the top of the file explain each field. The main parts are:

- **`steps`**: the trial in order. Each step is `judge`, `opening`, `witness`, `closing` or `instructions`.
- **Witness transcripts**: lists of `{ q, a }` question-and-answer pairs. Add `card: "id"` to let the player write that answer down, or `show: "Exhibit label"` to display an exhibit. Objections look like `{ objection, by, ruling, note }`.
- **`cards`**: the facts a player can collect. `dir: 1` points toward guilty or liable, `dir: -1` the other way. `power` runs from 1 to 3. `tags` say what kind of evidence it is. Set `struck: true` for anything the judge throws out.
- **`jury`**: each juror's starting opinion (0 to 100), their first comments, and the arguments they raise during deliberation.
- **`looks`**: each character's portrait, keyed by their name as it appears in the case: `skin` (0 to 5, light to deep), `hair`, `hairColor`, optional `facial`, `glasses` and `older`, and `clothes`. Anyone without a look gets one generated from their name. A transcript line can set `sfx: "murmur"` to make the gallery murmur after it. A transcript line can set `expression` (`calm`, `nervous`, `angry`, `sad`, `smug` or `surprised`) for the witness's face; otherwise witnesses look nervous on cross-examination and calm on direct.
- **`contradictions`**: testimony that conflicts with an earlier fact. Each names the conflicting line (give that transcript line a `mark`), the earlier fact (`conflictsWith`), the `bonus` fact the finder earns, and an `explain` text. Give each case one pointing each way.
- **Reactions**: computer jurors react on their own to facts matching what they care about. A transcript line can add hand-written ones with `react: [{ juror, word, expression }]`.
- **Deliberation**: a fact can list `rebuts: ["id"]` (the facts it answers) and `replies: { juror: { moved, unmoved } }` for a hand-written reply. Jurors' `approaches` and `replies` (per kind of evidence) live in `window.JURORS` and work for every case.
- **`truth`**: `lawful` is the verdict the evidence supports, `actual` is what really happened, plus the story and the lesson shown at the end.
