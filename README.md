# Instagram Browser Bot

##### *This Instabot requires Chrome*

This Instabot will automatically like instagram posts depending on these conditions:
  * posts includes specified tags
  * posts doesn't include specified tags
  * posts that has less likes than specified maximum likes
  * posts that has more likes than specified minimum likes
  * you have not liked this post before
  * you are not following the user

It will comment on posts depending on these conditions:
  * posts includes specified tags for l4l or f4f
  * posts has been successfully liked
  * post has an image alt tag you specified
  * you are not following the user

It will Follow users on these conditions:
  * you have successfully commented for f4f
  * you are not following the user

The Instabot will NOT do these if Filtering is turned off:
  * commenting
  * following
  * checking min/max likes
  * checking if the user is followed

---
### Instruction
  1. Copy this script to your favourite IDE (sublime, notepad, vim etc.)
  2. Customize `this.conditions` and `this.comments` to your need (I don't recommend changing delay times)
  3. Copy the entire script
  4. Visit www.instagram.com and search for any tags (url should say www.instagram.com/explore/tags/your-desired-tag)
  5. Open console on chrome (You MUST enable developers mode)
    - Windows : `Ctrl` + `Alt` + `i`
    - Mac : `Cmd` + `option` + `i`
  6. Under Console, paste the script then `enter`
  7. Click Start Instabot OR press `'`
  8. Press `'` to stop

### Hoykeys

  | Key         | Task                                                                            |
  | :---------- | :-----------                                                                    |
  | `'`         | Start / Stop Instabot                                                           |
  | `\`         | Toggle Filter (Filtering off will like everything but won't comment nor follow) |
  | `Shift + \` | Toggle Following (Following off will not comment for F4F)                       |
  | `=`         | Show my likes                                                                   |
  | `;`         | Toggle Logs                                                                     |
  | `:`         | Clear Logs                                                                      |

note: You can't click any buttons when instabot is in progress. Press `'` and wait until the last task is done.

---

### Customize these in the scripts :
  | `this.conditions.` | Description                                     |
  | :---------------   | :---------------------------------------------  |
  | `maxFollows`       | Maximum follow until last initialised task ends |
  | `maxLiked`         | Maximum likes until last initialised task ends  |
  | `minLikes`         | Minimum likes required to like the post         |
  | `maxLikes`         | Maximum likes required to like the post         |
  | `imageAlt`         | Image Alt required to comment=>follow           |
  | `include`          | Tags required to like post                      |
  | `exclude`          | Tags required to NOT like post                  |

  | `this.comments.`        | Description                                    |
  | :---------------        | :--------------------------------------------- |
  | `conditions.followback` | Tags required to comment f4f                   |
  | `conditions.likeback`   | Tags required to comment l4l                   |
  | `comments.followback`   | Random comments for f4f                        |
  | `comments.likeback`     | Random comments for l4l                        |
  | `emoji`                 | Random Emoji at the end of the comment         |

