# This bot will automatically like instagram posts

##### *This bot requires Chrome*

---
### Instruction
1. Copy this script to your favourite IDE (sublime, notepad, vim etc.)
2. Customize it to your need (I don't recommend changing delay times)
3. Copy the script
4. Visit www.instagram.com/explore/tags/(whatever tag you want)
5. Open console on chrome
  - Windows : `Ctrl` + `Alt` + `i`
  - Mac : `Cmd` + `option` + `i`
6. Under Console, paste the script then `enter`
7. Type `instabot.init()` (from Top Post) or `instabot.init(false)` (from Most Recent)
8. Type `instabot.stop()` to stop.

---

### Tips

* To check your status, type `instabot.check()`
* If you wish to force like all posts, type `instabot.toggleFilter()`
* On your feed, run `instabot.likeAllOnMyFeed()` to like everyone's posts :D
* On a profile page, run `instabot.showWhoUnfollowedMe()`. Wait, and you will see the list of people who are not following you back!

### Customize these in the scripts :
```js
this.time.maxDuration           // How long you wish to run bot for
this.conditions.maxLikes        // Skip those who have too many likes
this.include                    // Like those who has these tags
```
