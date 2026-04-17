import type { Pack } from '../types';

// Quest: Ship the Ripoff
// Narrative: First day at Midnight Polygon Studios. CEO wants the GTA-ripoff
// (StreetRacer Unlimited) on GitHub by noon so the world can play it.
// Player learns gh, git, and basic navigation to make it happen.

const pack: Pack = {
  id: 'github-cli',
  title: 'Ship the Ripoff',
  synopsis: 'Day one at Midnight Polygon Studios. The CEO wants StreetRacer Unlimited live on GitHub by noon.',
  tool: 'gh',
  steps: [
    {
      id: 'survey-the-repo',
      narration:
        "You arrive at Midnight Polygon Studios at 8:59am. Your badge doesn't work yet. You knock. A senior dev opens the door, drops a laptop in your arms, and says: \"Game's done. 47,000 lines. CEO wants it on GitHub before lunch or heads roll. Files are in the current directory. Figure it out.\" The door closes. You open the terminal.",
      objective: 'List the files in the project directory to see what you\'re working with.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /src|assets|package|index|README|game/i.test(r.stdout),
          reason: 'expected a file listing showing project structure',
        }),
      },
      hints: [
        'You need to see what\'s in this directory before you touch anything.',
        'There\'s a command for listing files.',
        'Try: `ls` or `ls -la`',
      ],
      xp: 15,
    },
    {
      id: 'read-the-readme',
      narration:
        "There's a README in there. The CEO will definitely ask what stack this thing is built on during the launch tweet. You should probably know before you push 47,000 lines of mystery code to the internet.",
      objective: 'Read the README.md file.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'StreetRacer',
      },
      hints: [
        'You want to read the contents of a file.',
        '`cat` prints a file\'s contents to stdout.',
        'Try: `cat README.md`',
      ],
      xp: 15,
    },
    {
      id: 'check-git-status',
      narration:
        "Okay. Three.js, Cannon.js, open world — not bad. Now the question is: is this thing even tracked by git? And if it is, is everything committed? You don't push a half-staged mess.",
      objective: 'Check the current git status of the repo.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /branch|nothing|modified|untracked|commit|Changes/i.test(r.stdout),
          reason: 'expected git status output',
        }),
      },
      hints: [
        'Git has a command for inspecting the current state of the repo.',
        'It shows staged, unstaged, and untracked files.',
        'Try: `git status`',
      ],
      xp: 20,
    },
    {
      id: 'stage-the-changes',
      narration:
        "There are modified files and one untracked CHANGELOG. The world deserves to know what changed in 0.9.0. Stage everything.",
      objective: 'Stage all changes for commit.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: r.exitCode === 0,
          reason: 'expected git add to succeed',
        }),
      },
      hints: [
        'You want to stage all changes at once.',
        '`git add` is how you stage files.',
        'Try: `git add .` or `git add -A`',
      ],
      xp: 20,
    },
    {
      id: 'commit-the-changes',
      narration:
        "Staged. Now seal it with a commit message that future-you will respect. Something that says \"we shipped\" without screaming \"we panicked.\"",
      objective: 'Commit the staged changes with a message.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /main|commit|file/i.test(r.stdout),
          reason: 'expected a successful git commit',
        }),
      },
      hints: [
        'You commit staged changes with `git commit`.',
        'Always include a message with the `-m` flag.',
        'Try: `git commit -m "feat: v0.9.0 — ready to ship"`',
      ],
      xp: 25,
    },
    {
      id: 'verify-gh',
      narration:
        "The commit is in. Now you need GitHub CLI to create the remote repo and push. A junior dev once tried to do this manually over the API. They were never seen again. Check that `gh` is on your PATH.",
      objective: 'Confirm the `gh` CLI is installed.',
      verify: { mode: 'which', binary: 'gh' },
      hints: [
        'Before you use a tool, make sure it exists on your system.',
        'Your shell has a command for finding where a binary lives.',
        'Try: `which gh`',
      ],
      xp: 15,
    },
    {
      id: 'check-gh-version',
      narration:
        "Good — it's there. But the intern installed it 18 months ago and forgot to update. An outdated `gh` is how you end up with auth bugs at 11:58am. Check the version.",
      objective: 'Print the installed version of `gh`.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutMatches: 'gh version',
      },
      hints: [
        'Most CLI tools have a flag to print their version.',
        'It usually involves the word "version".',
        'Try: `gh --version`',
      ],
      xp: 15,
    },
    {
      id: 'auth-status',
      narration:
        "Version checks out — recent enough. Now: are you actually authenticated with GitHub? `gh` needs to know who you are before it will create anything on your behalf.",
      objective: 'Check your GitHub authentication status.',
      verify: {
        mode: 'shell',
        custom: (r) => ({
          ok: /github\.com|Logged in|carlosfranzetti/i.test(r.stdout + r.stderr),
          reason: 'expected auth status output',
        }),
      },
      hints: [
        'There is a subcommand family for identity and authentication.',
        'It starts with `gh auth`.',
        'Try: `gh auth status`',
      ],
      xp: 20,
    },
    {
      id: 'create-repo',
      narration:
        "You're logged in. 11:34am. Twenty-six minutes. Time to create the repo. Public — the CEO explicitly said \"the world should be able to fork this.\" You've never agreed with him on anything before, but open source is open source.",
      objective: 'Create a public GitHub repo named `street-racer-unlimited`.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /Created|github\.com|street-racer/i.test(r.stdout),
          reason: 'expected the repo creation output',
        }),
      },
      hints: [
        '`gh` can create repos directly from the command line.',
        'The subcommand is `gh repo create`. Use `--public` to make it public.',
        'Try: `gh repo create street-racer-unlimited --public`',
      ],
      xp: 35,
    },
    {
      id: 'push-the-code',
      narration:
        "The remote exists. The local commit is ready. 11:41am. Push it. One command stands between you and the entire internet playing StreetRacer Unlimited.",
      objective: 'Push the committed code to GitHub.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /main|Writing objects|done|->/.test(r.stdout),
          reason: 'expected push output',
        }),
      },
      hints: [
        'You push local commits to a remote with `git push`.',
        'The remote is called `origin`, the branch is `main`.',
        'Try: `git push origin main`',
      ],
      xp: 35,
    },
    {
      id: 'verify-live',
      narration:
        "11:43am. Seventeen minutes to spare. Verify the repo is live. Not for you — for the CEO, who is already composing a tweet and will want the URL in the next two minutes.",
      objective: 'View the live GitHub repo to confirm it shipped.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'street-racer',
      },
      hints: [
        '`gh` can show you a repo\'s metadata straight from the terminal.',
        'The subcommand is `gh repo view`.',
        'Try: `gh repo view carlosfranzetti/street-racer-unlimited`',
      ],
      xp: 30,
    },
    {
      id: 'victory-echo',
      narration:
        "The repo is live. The CEO tweets: \"We shipped. The people's GTA. Play it. Fork it. Build on it.\" It gets 4,200 retweets in an hour. The senior dev who handed you the laptop pokes their head in: \"Not bad for day one.\" Seal the moment.",
      objective: 'Print a message containing "shipped".',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'shipped',
      },
      hints: [
        'Use `echo` to print something.',
        'Your message just needs to include the word "shipped".',
        'Try: `echo "StreetRacer Unlimited: shipped"`',
      ],
      xp: 25,
    },
  ],
};

export default pack;
