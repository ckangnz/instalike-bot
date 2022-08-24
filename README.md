# Instagram Browser Bot

# DEPRECATED - This repository is no longer maintained.

Instagram is updating their GUI so this plugin will no longer work. I'll come up with better solution on my next project which will be easier to maintained. Thanks for using!

##### _This Instabot requires Chrome_

This Instabot will automatically like instagram posts depending on these conditions:

- posts includes specified tags
- posts doesn't include specified tags
- posts that has less likes than specified maximum likes
- posts that has more likes than specified minimum likes
- you have not liked this post before
- you are not following the user

It will comment on posts depending on these conditions:

- posts includes specified tags for l4l or f4f
- posts has been successfully liked
- post has an image alt tag you specified
- you are not following the user

It will Follow users on these conditions:

- you have successfully commented for f4f
- you are not following the user

The Instabot will NOT do these if Filtering is turned off:

- commenting
- following
- checking min/max likes
- checking if the user is followed

---

### Instruction

1. Download the project.
2. Open `instabot.js`, and edit 'options' to your need.
3. Save the file.
4. Visit [chrome://extensions](chrome://extensions) and enable Developer mode (at the top right)
5. Click on `Load unpacked` and choose this project's folder.
6. Visit [ www.instagram.com ](www.instagram.com) and search for any tags (url should say www.instagram.com/explore/tags/your-desired-tag)
7. Click on the extension you just added.
8. Click Start Instabot OR press `'`
9. Press `'` to stop

### Hoykeys

| Key         | Task                                                                            |
| :---------- | :------------------------------------------------------------------------------ |
| `'`         | Start / Stop Instabot                                                           |
| `-`         | Toggle Filter (Filtering off will like everything but won't comment nor follow) |
| `_`         | Start from Top Post or Recent Post                                              |
| `\`         | Toggle Commenting (Commenting off will not comment nor follow)                  |
| `Shift + \` | Toggle Following (Following off will only comments for L4L)                     |
| `=`         | Show my likes                                                                   |
| `+`         | Show current setting                                                            |
| `;`         | Toggle Logs                                                                     |
| `:`         | Clear Logs                                                                      |

note: You can't click any buttons when instabot is in progress. Press `'` and wait until the last task is done.

---

### Customize the option at the top :

##### Note

- For random comments, wrap your comment in `""` and put `,` at the end
- Remove `,` at the end of `emoji` if you wish to have emoji all the time.

| General option | Description                                     |
| :------------- | :---------------------------------------------- |
| `maxDuration`  | Maximum duration in minutes                     |
| `maxFollows`   | Maximum follow until last initialised task ends |
| `maxLiked`     | Maximum likes until last initialised task ends  |
| `minLikes`     | Minimum likes required to like the post         |
| `maxLikes`     | Maximum likes required to like the post         |
| `imageAlt`     | Image Alt required to comment=>follow           |
| `include`      | Tags required to like post                      |
| `exclude`      | Tags required to NOT like post                  |

| Comments Option         | Description                            |
| :---------------------- | :------------------------------------- |
| `conditions.followback` | Tags required to comment f4f           |
| `conditions.likeback`   | Tags required to comment l4l           |
| `comments.followback`   | Random comments for f4f                |
| `comments.likeback`     | Random comments for l4l                |
| `emoji`                 | Random Emoji at the end of the comment |
