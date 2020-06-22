const options = {
    myid : 'ckangnz',
    maxDuration : 10, //min
    maxFollows  : 10,
    maxLiked    : 80,
    minLikes    : 15,
    maxLikes    : 300,
    imageAlt : "1 person, 2 people, people, closeup, selfie, 사람 1명, 사람 2명", 
    include : "인스타, 인친, 인친해요, 라이크, 좋아요, 좋아요환영, 좋아요반사, 라이크반사, 반사, l4l, like, instalike, follow, followme, 맞팔, 팔로우, 맞팔해요, f4f", 
    exclude:"10k, 20k, 30k, 10kfollowers, 20kfollowers, 맞팔100, 선팔100, 오늘의훈남, 훈남그램, 흔남그램, 육아스타그램, 육아, 육아그램, 고딩, 18, 19, 고1, 고2, 고3", 
    comments : {
        conditions : {
            followback : "선팔맞팔, 선팔하면맞팔, 선팔하면맞팔가요, 선팔후맞팔, 맞팔, 소통, 언팔싫어요, 언팔하면언팔", 
            likeback : "좋아요반사, 라이크반사, 좋반, 맞좋아요", 
        },
        comments : {
            followback: [
                '선팔하고 가요! 맞팔해주세용','선팔했습니다아아! 맞팔해용','선팔합니다~ 맞팔해주시꺼죠?',
                '맞팔하고싶어요! 먼저선팔할게요!','반가워요! 먼저 팔로우하고 갈게요','선팔먼저 할게요! 맞팔부탁드려요',
                '괜찮다면 소통하고싶어요! 선팔합니다아아','소통하구시퍼요! 선팔하구가용!','소통해욧! 맞팔해주셔용',
            ],
            likeback: [
                '피드 잘보구가요','좋아요하구갑니다','안녕하세요 :) 조아요누르고가요','제꺼두 좋아요 눌러주시와요 ㅋㅋ','죠아욧!','굳굳','좋반요!','좋아요반사요!','좋반해주세요','좋아요 반사하러왔어요~~','맞좋아요하러왔어요!','좋아요먼저누르고갈게여!',
            ],
        },
        emoji: "😊, 😛, 🤗, 🤗🤗, 😄, 😄😄, 🤙, 👍, 🙌, 🙌🙌, 🙏, 🙏🙏🙏, :), :D, ;), ㅎㅎ, ㅋㅋㅋ,•̀.̫•́✧,٩(๑òωó๑)۶,(๑´•.̫•`๑),(•̀ㅁ•́), (｀･ω･´)ゞ, ", 
    }
}
class Instabot {
    constructor(options){
        this.myid = options.myid;
        this.s = 1000;
        this.min = 60 * this.s;
        this.hr = 60 * this.min;
        this.time = {
            start: performance.now(),
            delayInitial: 2 * this.s,
            delayLike: 1.5 * this.s,
            delayFollow: 2 * this.s,
            delayNext: 2 * this.s,
            maxDuration: options.maxDuration * this.min,
        };
        this.element = {
            popup: 'div._2dDPU.vCf6V[role=dialog]',
            name : 'a.notranslate:first-child',
            personImage: 'article ._2dbep img',
            image: 'article div[role=button] .KL4Bh img.FFVAD',
            post: "a[href*='/p/']:not(.zV_Nj):not(.FH9sR):not(.c-Yi7)",
            postCloseBtn: ".ckWGn",
            recentPost : '.yQ0j1:nth-child(2) ~ div a[href*="/p/"]:not(.zV_Nj)',
            numberOfLikes : `article section div div:last-child button[type=button] span,
                             article section div div:last-child a.zV_Nj span`,
            likeBtn:'article span.glyphsSpriteHeart__outline__24__grey_9.u-__7',
            reply: '.Igw0E:not(.MGdpg) span.EizgU',
            extraReply: 'span.glyphsSpriteCircle_add__outline__24__grey_9.u-__7',
            tags : 'article a[href*="/tags/"]',
            mycomment: `a.notranslate[href="/${options.myid}/"]`,
            nextBtn: 'a.coreSpriteRightPaginationArrow',
            followBtn: 'button.oW_lN:not(._8A5w5)',
            followersBtn : 'a.-nal3',
            followersOverHidden : '.isgrP',
            followersInnerHeight : 'ul.jSC57._6xe7A',
            followersList: 'a.FPmhX.notranslate._0imsa',
            followerPopupCloseBtn:'.WaOAr button.wpO6b',
            followerPopupLoadingIcon : '.W1Bne.ztp9m',
            suggestionsTitle: 'h4._7UhW9',
            commentPostBtn : '.X7cDz button',
            commentFailAlert : '.gxNyb',
        }
        this.status ={
            liked : [],
            followed: [],
            archivedLiked:[],
            archivedFollowed:[],
            unfollowers:[],
            inProgress: false,
            logs:[],
        }
        this.options = {
            includeTop : true,
            isFiltering: true,
            isFollowing : true,
            isCommenting : true,
        }
        this.conditions = {
            maxFollows: options.maxFollows,
            maxLiked: options.maxLiked,
            minLikes: options.minLikes,
            maxLikes : options.maxLikes,
            imageAlt : options.imageAlt.replace(/, /g,',').split(','),
            include: options.include.replace(/ /g,'').split(',') || [],
            exclude: options.exclude.replace(/ /g,'').split(',') || [],
        }
        this.comments = {
            conditions : {
                followback : options.comments.conditions.followback.replace(/ /g,'').split(','),
                likeback : options.comments.conditions.likeback.replace(/ /g,'').split(','), 
            },
            comments : {
                followback: options.comments.comments.followback,
                likeback: options.comments.comments.likeback,
            },
            emoji: options.comments.emoji.split(','),
        }
        this.font ={
            heading: 'font-size:12px;font-weight:bold;',
            super:'font-size:12px;font-weight:bold;text-align:center;background:black;',
            small : 'font-size:8px;',
            link: 'color:deepskyblue;',
            good:'font-size:10px;background:rgba(148,0,211,0.3);', //violet
            progress:'font-size:10px;background:rgba(250,218,94,0.3);', //yellow
            override:'font-size:8px;background:rgba(30,144,255,0.3);', //blue
            pass:'font-size:8px;background:rgba(0,256,0,0.3);', //green
            error:'font-size:8px;background:rgba(256,0,0,0.3)', //red
            loading:'font-size:8px;background:rgba(80,80,80,0.3)', //grey
        }
    }
    delay(ms){
        return new Promise(resolve=>setTimeout(resolve,ms))
    }
    generateRandomComment(c){
        return c[Math.floor(Math.random()*c.length)] 
    }
    clearLogger(){
        this.status.logs = [];
        this.updateLogBox(this.status.logs);
    }
    logger(text,style){
        const log = `<p style="${style}">${text}</p>`;
        this.status.logs.push(log);
        this.updateLogBox(this.status.logs);
    }
    updateLogBox(logs){
        const logbox = document.getElementById('LogBox');
        logbox.innerHTML = logs.join('');
        if(logbox.className != 'hovered'){
            logbox.scrollTop = logbox.scrollHeight;
        }
    }
    init(){
        this.status.inProgress = true;
        this.time.start = performance.now();
        this.archive();
        this.openPost()
        this.logger(`INITIATING INSTABOT`,this.font.super);
        this.delay(this.time.delayInitial)
            .then(()=> this.analyzePost() )
    }
    archive(){
        if(this.status.liked.length > 0 ){
            this.status.archivedLiked = [...this.status.liked, ...this.status.archivedLiked];
            this.logger(`Archiving likes`,this.font.small);
            this.status.liked = [];
        }
        if(this.status.followed.length > 0 ){
            this.status.archivedFollowed = [...this.status.followed, ...this.status.archivedFollowed ];
            this.logger(`Archiving follows`,this.font.small);
            this.status.followed = [];
        }
    }
    stop(){
        this.logger(`STOPPING. PLEASE WAIT..`,this.font.super);
        this.status.inProgress = false;
    }
    openPost(){
        if(!document.querySelector(this.element.popup)){
            const post = (this.options.includeTop)
                ? document.querySelector(this.element.post)
                : document.querySelector(this.element.recentPost)
                ? document.querySelector(this.element.recentPost)
                : null;
            (post)
                ?post.click()
                :this.logger(`Post missing`,this.font.error)
        }
    }
    analyzePost(){
        if(this.status.inProgress){
            this.logger(`===========================================`,this.font.small);
            this.resetPost()
                .then(()=> this.getName())
                .then(()=> this.getNumberOfLikes())
                .then(()=> this.openHiddenComments())
                .then(()=> this.checkLiked())
                .then(()=> this.checkCommented())
                .then(()=> this.checkFollowed())
                .then(()=> this.getTags())
                .then(()=> this.getImage())
                .then(()=> this.validatePost())
                .then(()=> this.processPost(),err=>this.logger(err,this.font.error))
                .then(()=> this.delay(this.time.delayNext))
                .then(()=> this.nextImage())
        } else {
            this.nextImage();
        }
    }
    nextImage(){
        if(this.status.liked.length >= this.conditions.maxLiked) { 
            this.logger(`You have already liked ${this.conditions.maxLiked} images. Restarting will reset`,this.font.heading);
            const evt = new KeyboardEvent('keydown', {'keyCode':222, 'which':222});
            document.dispatchEvent(evt);
        }  
        if(this.status.followed.length >= this.conditions.maxFollows) { 
            this.logger(`You have already followed ${this.conditions.maxFollows} followers. Restarting will reset`,this.font.heading);
            const evt = new KeyboardEvent('keydown', {'keyCode':222, 'which':222});
            document.dispatchEvent(evt);
        }  
        if(!(performance.now() - this.time.start < this.time.maxDuration)){
            this.logger(`Times up!!`,this.font.super);
            const evt = new KeyboardEvent('keydown', {'keyCode':222, 'which':222});
            document.dispatchEvent(evt);
        }
        if(
            this.status.inProgress
        ){
            const nextbtn = document.querySelector(this.element.nextBtn);
            nextbtn ? nextbtn.click() : true;
            this.logger(`Liked ${this.status.liked.length} images. (max:${this.conditions.maxLiked})`,this.font.small);
            this.logger(`Followed ${this.status.followed.length} people (max:${this.conditions.maxFollows})`,this.font.small);
            this.logger(`Time remaining: ${ Math.round((this.time.maxDuration - (performance.now() - this.time.start))/this.min*10)/10} minutes`,this.font.small);
            this.logger('====next====>',this.font.heading);
            this.delay(this.time.delayInitial)
                .then(()=>this.checkEndOfPost())
                .then(()=>this.analyzePost())
        } else {
            this.logger(`Total Like count: ${this.status.liked.length} images`,this.font.pass);
            this.logger(`Total Follow count: ${this.status.followed.length}`,this.font.pass);
            this.status.followed.forEach((f)=>{
                this.logger(`<a style="${this.font.link}" target="_blank" href="${f.person.personLink}">${f.person.personName}</a> `,this.font.small);
            })
            this.logger(`FINISHED`,this.font.super);
            //document.querySelector(this.element.postCloseBtn).click();
        }
    }
    checkEndOfPost(){
        return new Promise(resolve=>{
            if(this.post.src == window.location.href){
                this.logger(`END OF POSTS`,this.font.super+'font-size:10px;')
                const evt = new KeyboardEvent('keydown', {'keyCode':222, 'which':222});
                document.dispatchEvent(evt);
            }
            resolve();
        })
    }
    resetPost(){
        return new Promise(resolve=>{
            this.post = {};
            this.post.src = window.location.href;
            return resolve();
        })
    }
    getName(){
        return new Promise(resolve=>{
            this.post.person = document.querySelector(this.element.name) != null
                ? {
                    personName : document.querySelector(this.element.name).innerText,
                    personLink : document.querySelector(this.element.name).href,
                    personImage: document.querySelector(this.element.personImage).src,
                }
                : this.logger(`Couldn't load name. Retrying...`,this.font.error) 
                && this.waitFor(delay,()=>document.querySelector(this.element.name) != null 
                    ? {
                        personName : document.querySelector(this.element.name).innerText,
                        personLink : document.querySelector(this.element.name).href,
                        personImage: document.querySelector(this.element.personImage).src,
                    }
                    : null
                );
            return resolve();
        })
    }
    getTags(){
        return new Promise(resolve=>{
            const tags = document.querySelectorAll(this.element.tags);
            const hasTag = (this.conditions.include.length > 0 )
                ? Array.from(tags)
                .filter(function(w){
                    return this.indexOf(w.innerText.replace('#','')) >= 0;
                },this.conditions.include)
                .map((tag)=>{
                    return tag.innerText.replace('#','');
                })
                :[];
            const hasExcludes = (this.conditions.exclude.length > 0)
                ? Array.from(tags)
                .filter(function(w){
                    return this.indexOf(w.innerText.replace('#','')) >= 0;
                },this.conditions.exclude)
                .map((tag)=>{
                    return tag.innerText.replace('#','');
                })
                :[];
            const hasF4F = (this.comments.conditions.followback.length > 0 )
                ? Array.from(tags)
                .filter(function(w){
                    return this.indexOf(w.innerText.replace('#','')) >= 0;
                },this.comments.conditions.followback)
                :[];
            const hasL4L = (this.comments.conditions.likeback.length > 0 )
                ? Array.from(tags)
                .filter(function(w){
                    return this.indexOf(w.innerText.replace('#','')) >= 0;
                },this.comments.conditions.likeback)
                :[];
            this.post.tags = {
                hasTag,
                hasExcludes,
                hasF4F:hasF4F.length>0,
                hasL4L:hasL4L.length>0,
            }
            return resolve();
        })
    }
    openHiddenComments(){
        return new Promise(resolve=>{
            const extraReply = document.querySelectorAll(this.element.extraReply); 
            extraReply? extraReply.forEach((t)=>t.click()):true;
            const reply = document.querySelectorAll(this.element.reply);
            reply ? reply.forEach((t)=>t.click()):true;
            return resolve();
        })
    }
    getNumberOfLikes(){
        return new Promise(resolve=>{
            this.post.numberOfLikes = document.querySelector(this.element.numberOfLikes) != null
                ? parseInt(document.querySelector(this.element.numberOfLikes).innerText.replace(',','')) 
                :0;
            return resolve();
        });
    }
    getImage(){
        return new Promise(resolve=>{
            const image = document.querySelector(this.element.image); 
            const src = image ? image.currentSrc : image ? image.src : null
            const alt = image ? image.alt : null
            const isSafe = (alt!=null && this.conditions.imageAlt.length > 0)
                ?  this.conditions.imageAlt.some((v)=> {
                    return alt.indexOf(v) >= 0;
                })
                :null
            this.post.image = {
                src,
                alt, 
                isSafe
            }
            return resolve();
        })
    }
    checkLiked(){
        return new Promise(resolve=>{
            this.post.likeBtn = document.querySelector(this.element.likeBtn);
            this.post.liked = (this.post.likeBtn)?false:true;
            return resolve();
        });
    }
    checkCommented(){
        return new Promise(resolve=>{
            const comment = document.querySelector(this.element.mycomment);
            this.post.comment = comment ? comment :null;
            return resolve();
        });
    }
    checkFollowed(){
        return new Promise(resolve=>{
            this.post.followbtn = document.querySelector(this.element.followBtn);
            this.post.followed = (this.post.followbtn)?false:true;
            return resolve();
        })
    }
    validatePost(){
        return new Promise((resolve,reject)=>{
            const {
                person,
                src,
                tags,
                numberOfLikes,
                liked,
                comment,
                followed,
            } = this.post;

            if(person == null){
                return reject(`Couldn't load the person`);
            } else {
                this.logger(`ID: <a style="${this.font.link}" target="_blank" href="${person.personLink}">${person.personName}</a>`,this.font.heading)
                this.logger(`Current post: <a style="${this.font.link}" target="_blank" href="${src}">${src}</a>`,this.font.small)
            }

            if(liked){
                return reject("Already liked.");
            } 
            if(comment){
                return reject("Already commented.");
            } 
            if(!this.options.isFiltering){
                return resolve("Filtering OFF. Skipping Validation.");
            }
            if (followed){
                return reject("Already followed.");
            }

            if(numberOfLikes < this.conditions.minLikes){
                return reject("Not enough likes");
            } else if (numberOfLikes > this.conditions.maxLikes){
                return reject("Too many likes");
            } else {
                this.logger(`Passed like filter : ${this.conditions.minLikes} < ${numberOfLikes} < ${this.conditions.maxLikes}`,this.font.good);
            } 

            if( tags.hasTag.length == 0 ){
                return reject("No Matching tags.");
            } else if( tags.hasExcludes.length > 0 ){
                const unwantedTags = tags.hasExcludes.join(',');
                return reject(`Found unwanted tags:${unwantedTags}`);
            } else {
                const wantedTags = tags.hasTag.join(',');
                this.logger(`Found ${tags.hasTag.length} matching tags:${wantedTags}`,this.font.good);
            } 
            return resolve();
        })
    }
    processPost(){
        return new Promise(resolve=>{
            if(this.status.inProgress){
                this.logger(`Processing....`,this.font.loading);
                (!this.options.isFiltering)
                    ? this.logger(`Filtering is OFF.`,this.font.override)
                    :null;
                this.likePost()
                    .then(()=> this.writeComment())
                    .then(()=> this.submitComment())
                    .then(()=> this.follow(),err=>err?this.logger(err,this.font.error):null)
                    .then(()=>resolve())
            } else {
                this.logger(`Process Skipped`,this.font.error);
                return resolve();
            }
        })
    }
    likePost(){
        return new Promise(resolve=>{
            this.logger(`....liking post in ${this.time.delayLike/this.s}s..`,this.font.progress);
            this.delay(this.time.delayLike)
                .then(()=>{
                    this.post.likeBtn.click();
                    this.post.liked = true;
                    this.status.liked.push(this.post);
                    this.logger(`Successfully LIKED post`,this.font.pass);
                    return resolve();
                })
        })
    }
    writeComment(){
        return new Promise((resolve,reject)=>{
            const {
                liked,
                tags,
                image,
            } = this.post;

            if(
                this.options.isFiltering 
                && this.options.isCommenting 
                && liked 
                && (tags.hasF4F || tags.hasL4L)
                && image.isSafe
            ){
                const f4fcom = this.comments.comments.followback;
                const l4lcom = this.comments.comments.likeback;
                const input = document.querySelector('.Ypffh'); 

                if(input){
                    const lastValue = input.value;
                    const comment = 
                        (tags.hasF4F && this.options.isFollowing)
                        ? this.generateRandomComment(f4fcom)
                        :(tags.hasL4L)
                        ? this.generateRandomComment(l4lcom)
                        :null;
                    if(comment != null){
                        const emoji = this.generateRandomComment(this.comments.emoji)
                        this.post.comment = comment + emoji;
                        input.value = this.post.comment;
                        const event = new Event('change', { bubbles: true });
                        event.simulated = true;
                        const tracker = input._valueTracker;
                        if (tracker) {
                            tracker.setValue(lastValue);
                        }
                        input.dispatchEvent(event);
                        return resolve();
                    } else {
                        return reject("Comments generating failed : No matching tags for comments");
                    }
                } else {
                    return reject("Commenting failed: Input missing");
                }
            } else {
                const message = (!this.options.isFiltering)
                    ?null
                    :(!this.options.isCommenting)
                    ?`Skipping comments. Commenting Off`
                    :(!liked)
                    ?`Skipping comments. Not liked`
                    :(!image.isSafe)
                    ?`Skipping comments. Image not safe`
                    :(!tags.hasF4F && !tags.hasL4L)
                    ?`Skipping comments. Missing required tags`
                    :null;
                return message?reject(message):reject();
            }
        })
    }
    submitComment(){
        return new Promise((resolve, reject)=>{
            if(
                this.options.isFiltering 
                && this.options.isCommenting
                && this.post.comment != null
            ){
                const btn = document.querySelector(this.element.commentPostBtn);
                if(btn){
                    const delayComment = Math.round(this.post.comment.length * 0.4);
                    this.logger(`....posting comment in ${delayComment}s..`,this.font.progress)
                    this.delay(delayComment * this.s)
                        .then(()=>{
                            btn.click() 
                            this.logger(`....checking if comment posted ${this.time.delayNext/this.s}s...`,this.font.progress);
                            setTimeout(()=>{
                                const hasFailed = document.querySelector(this.element.commentFailAlert)?true:false;
                                if(hasFailed){
                                    this.post.comment = null;
                                    return reject('Failed to comment!');
                                } else {
                                    this.logger(`Successfully POSTED comment: "${this.post.comment}"`,this.font.pass)
                                    return resolve() 
                                }
                            },this.time.delayNext);
                        })
                } else {
                    return reject('Comment button missing');
                }
            }else{
                if(this.post.comment == null){
                    return reject("Comment missing")
                }
            }
        })
    }
    follow(){
        return new Promise(resolve=>{
            const {
                tags,
                comment,
                followbtn,
                followed 
            } = this.post;

            if( 
                this.options.isFiltering
                && this.options.isCommenting 
                && this.options.isFollowing 
                && comment != null 
                && tags.hasF4F
                && !followed
                && this.conditions.maxFollows >= this.status.followed.length
            ){
                this.logger(`....Following in ${this.time.delayFollow/this.s}s....`,this.font.progress);
                this.delay(this.time.delayFollow)
                    .then(()=>{
                        if(followbtn){
                            followbtn.click();
                            this.post.followed = true;
                            this.status.followed.push(this.post);
                            this.logger(`FOLLOWED: <a style="${this.font.link}" style="${this.font.link}" target="_blank" href="${this.post.person.personLink}">${this.post.person.personLink}</a>`,this.font.pass);
                            resolve();
                        }
                        resolve();
                    })
            } else {
                (!this.options.isFiltering)
                    ? null
                    :(this.options.isCommenting && !comment)
                    ? null
                    :(this.conditions.maxFollows <= this.status.followed.length)
                    ? this.logger(`Skipping follow. Maximum follows reached`,this.font.error)
                    :(!this.options.isFollowing)
                    ? this.logger(`Following option turned off`,this.font.override)
                    :(followed)
                    ? this.logger(`Already following.`,this.font.small)
                    :(!tags.hasF4F)
                    ? this.logger(`Skipping follow. Missing required tags.`,this.font.error)
                    :null;
                return resolve();
            }
        })
    }
    getStatus(){
        console.log(this.status);
        return this.status;
    }
    async getUnfollowers(){
        this.logger(`Finding unfollowers.. Please wait..`,this.font.super)
        if(document.querySelectorAll(this.element.followersBtn).length > 0){
		debugger;
            const following = await this.loadFollowers(true).catch(err=>this.logger(err,this.font.error) && false);
            const followers = (following)? await this.loadFollowers(false).catch(err=>this.logger(err,this.font.error) && false):null;
            if(following && followers){
                const unfollowers = following.filter(function(f){
                    return this.indexOf(f) == -1;
                },followers)
                this.status.unfollowers.push(unfollowers);
                this.logger(`You have ${unfollowers.length} people who are not following back:`,this.font.heading)
                unfollowers.forEach((f)=>{
                    this.logger(`${f} : <a style="${this.font.link}" href="https://www.instagram.com/${f}" target="_blank">https://www.instagram.com/${f}</a>`,this.font.small)
                })
                return unfollowers;
            }
        } else {
            this.logger(`You are not on profile page!`,this.font.error);
        }
    }
    async loadFollowers(loadingFollowings){
        (loadingFollowings)
            ?this.logger(`...loading followings...`,this.font.loading)
            :this.logger(`...loading followers ...`, this.font.loading)
        return new Promise(async (resolve, reject )=> {
            const flBtn = document.querySelectorAll(this.element.followersBtn);
            (loadingFollowings)
                ? flBtn[flBtn.length-1].click()
                : flBtn[0].click()
            const result = await this.delay(this.time.delayInitial).then(()=> this.fetchPeople()).catch(err=>reject(err))
            resolve(result);
        })
    }
    fetchPeople(){
        return new Promise((resolve,reject) => {
            const itvl = setInterval(()=>{
                const scroll = document.querySelector(this.element.followersOverHidden);
                const innerbox = document.querySelector(this.element.followersInnerHeight);
                if(scroll && innerbox){
                    const loadedHeight = innerbox.scrollHeight
                    const isLoading = (document.querySelector(this.element.suggestionsTitle))
                        ? scroll.scrollTop != loadedHeight
                        : (document.querySelector(this.element.followerPopupLoadingIcon))?true:scroll.scrollTop + scroll.offsetHeight != loadedHeight 
                    if(isLoading){
                        scroll.scrollTop = loadedHeight;
                    } else {
                        clearInterval(itvl);
                        const list = Array.from(document.querySelectorAll(this.element.followersList)).map((p)=>{
                            return p.innerText
                        })
                        document.querySelector(this.element.followerPopupCloseBtn).click()
                        this.logger(`Finished collecting`,this.font.small);
                        setTimeout(()=>resolve(list),1000)
                    }
                } else {
                    clearInterval(itvl);
                    reject('Force canceled!');
                }
            }, 1000)
        })
    }
    likeAll(){
        document.querySelectorAll(this.element.likeBtn).forEach((b)=>{
            b.click()
            this.logger(`Liked all visible posts!`,this.font.heading)
        })
    }
    toggleIncludeTop(){
        this.options.includeTop = !this.options.includeTop;
        this.options.includeTop
            ? this.logger(`Start from Top`,this.font.pass)
            : this.logger(`Start from Recent`,this.font.error)
    }
    toggleFilter(){
        this.options.isFiltering = !this.options.isFiltering;
        this.options.isFiltering
            ? this.logger(`Filtering turned ON. Instabot will process tags`,this.font.pass)
            : this.logger(`Filtering turned OFF. Instabot will like everything but will not comment / follow`,this.font.error)
    }
    toggleFollowing(){
        this.options.isFollowing = !this.options.isFollowing;
        this.options.isFollowing
            ? this.logger(`Following ON. Instabot is following after commenting for F4F`,this.font.pass)
            : this.logger(`Following OFF. Instabot is not commenting for F4F / following`,this.font.error)
    }
    toggleCommenting(){
        this.options.isCommenting = !this.options.isCommenting;
        this.options.isCommenting
            ? this.logger(`Commenting ON. Instabot is commenting for L4L and F4F`,this.font.pass)
            : this.logger(`Commenting OFF. Instabot is not commenting / following`,this.font.error)
    }
}
class InstabotUI {
    constructor(instabot){
        this.instabot = instabot;
        this.style = {
            left : "position:fixed;bottom:10px;left:10px;padding:15px;z-index:99;",
            right: "position:fixed;bottom:10px;right:10px;padding:15px;z-index:99;",
            logger: "position:fixed;top:50px;left:0;width:25%;height:500px;overflow-y:auto;padding:15px;color:white;background:#252525;z-index:99;border-radius:5px;resize:vertical;box-shadow: 0 10px 20px rgba(0,0,0,0.19),0 6px 6px rgba(0,0,0,0.23);",
            popup: "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:80%;padding:10px;border-radius:15px;z-index:99;background:white;box-shadow: 0 10px 20px rgba(0,0,0,0.19),0 6px 6px rgba(0,0,0,0.23);",
            smallpopup: "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:40%;height:80%;padding:10px;border-radius:15px;z-index:99;background:white;box-shadow: 0 10px 20px rgba(0,0,0,0.19),0 6px 6px rgba(0,0,0,0.23);",
            popupInner: "overflow:auto;width:100%;height:100%",
            popupClose: "position:fixed; right:2em; top:1em;border:none;border-radius:5px;color:white;background:black;",
            ul: "display:flex;flex-flow:row wrap;margin-top:40px;box-sizing:border-box;",
            li: "display:flex;flex-flow:column;justify-content:space-between;width:25%;padding:1em;box-sizing:border-box;",
            person: "display:flex;justify-content:space-between;align-items:center;flex-flow:row;width:100%;margin-bottom:1em;",
            personImage : "width:50px; height:50px;border-radius:50%;",
            personFollowed: "color:teal;font-size:1em;",
            personNotFollowed: "color:tomato;font-size:1em;",
            postImage: "width:100%;min-width:30px;min-height:30px;background:lightgrey;height:auto;",
            postCommented: "font-size:1em;color:grey;",
            heading:"font-size:25px;font-weight:bold;margin-bottom:1em;",
            subheading:"font-size:15px;font-weight:bold;",
            bold:"font-weight:bold;",
            pass:'background:rgba(0,256,0,0.3);',
            error:'background:rgba(256,0,0,0.3)',
            btn : {
                blue : "background:dodgerblue;color:white;outline:none;border-radius:5px;border:none;padding:5px 10px;margin-top:5px;",
                red : "background:tomato;color:white;outline:none;border-radius:5px;border:none;padding:5px 10px;margin-top:5px;",
                green : "background:teal;color:white;outline:none;border-radius:5px;border:none;padding:5px 10px;margin-top:5px;",
            }
        }
    }
    init(){
        const left = this.createElement({
            id:'LeftPanel', type:"div", text:"", style:this.style.left,
            parent:document.body,
        },el=>el)
        const right = this.createElement({
            id:'RightPanel', type:"div", text:"", style:this.style.right,
            parent:document.body,
        },el=>el)
        const logger = this.createElement({
            id:'LogBox', type:'div', text:"", style:this.style.logger,
            parent:document.body,
        },logbox=>{
            logbox.addEventListener('mouseenter',function(){
                logbox.classList.add('hovered');
            })
            logbox.addEventListener('mouseleave',function(){
                logbox.classList.remove('hovered');
            })
        })

        const mylikedbtn = this.myLikedBtn(left);
        const togglelogboxbtn = this.toggleLogBoxBtn(left);
        const statusbtn = this.statusBtn(left);
        const toggleincludebtn = this.toggleIncludeTopBtn(left);
        const togglefilterbtn = this.toggleFilterBtn(left);
        const togglecommentingbtn = this.toggleCommentingBtn(left);
        const togglefollowbtn = this.toggleFollowingBtn(left);
        const clearlogbtn = this.clearLogBtn(left);

        const getunfollowersbtn = this.getUnfollowersBtn(right);
        const likeallbtn = this.likeAllBtn(right);
        const startbtn = this.startBtn(right);

        const self = this;
        document.addEventListener('keydown',function(e){
            if(e.keyCode == '222'){
                // ' to start
                e.preventDefault();
                self.startBtnClicked(startbtn);
            }
            if(e.keyCode == '186' && !e.shiftKey){
                // ; to toggle log box
                e.preventDefault();
                self.toggleLogBoxClicked(startbtn);
            }
            if(e.keyCode == '186' && e.shiftKey){
                // : clear log box
                e.preventDefault();
                self.instabot.clearLogger();
            }
            if(e.keyCode == '220' && !e.shiftKey){
                // \
                e.preventDefault();
                self.toggleCommentingBtnClicked(togglecommentingbtn);
            }
            if(e.keyCode == '220' && e.shiftKey){
                // |
                e.preventDefault();
                self.toggleFollowingBtnClicked(togglefollowbtn);
            }
            if(e.keyCode == '187' && !e.shiftKey){
                // =
                e.preventDefault();
                self.myLikedBtnClicked(mylikedbtn);
            }
            if(e.keyCode == '187' && e.shiftKey){
                // +
                e.preventDefault();
                self.statusBtnClicked(statusbtn);
            }
            if(e.keyCode == '189' && !e.shiftKey){
                // -
                e.preventDefault();
                self.toggleFilterBtnClicked(togglefilterbtn);
            }
            if(e.keyCode == '189' && e.shiftKey){
                // _
                e.preventDefault();
                self.toggleIncludeTopBtnClicked(toggleincludebtn);
            }
        })
    }
    createElement({ id, type,text,style,parent }, cb){
        const el = document.createElement(type);
        el.id = id;
        el.innerHTML = text;
        el.style = style;
        parent.appendChild(el);
        return cb(el);
    }
    createPopup(content, id, style){
        const popup = this.createElement({
            id:id,
            type:"div",
            text:"",
            style:style,
            parent:document.body,
        },p=>{
            const popupInner = this.createElement({
                id:'PopupInner',
                type:"div",
                text:`${content}`,
                style:this.style.popupInner,
                parent:p,
            },el=>el)
            return p;
        })
        return popup;
    }
    closePopup(p){
        p.parentNode.removeChild(p); 
        return p;
    }
    startBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'StartBtn',
            type:'button',
            text:"Start instabot ( ' )",
            style: self.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',()=>this.startBtnClicked(b))
            return b;
        })
        return btn;
    }
    startBtnClicked(btn){
        if(btn.className == 'started'){
            this.instabot.stop();
            btn.innerText="Start instabot ( ' )";
            btn.style = this.style.btn.green;
        } else {
            this.instabot.init();
            btn.innerText = "Stop instabot ( ' )";
            btn.style = this.style.btn.red;
        }
        btn.classList.toggle('started');
    }
    clearLogBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ClearLogBtn',
            type:'button',
            text:"Clear logs ( : )",
            style: this.style.btn.red,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                self.instabot.clearLogger();
            })
            return b;
        })
        return btn;
    }
    likeAllBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'LikeAllBtn',
            type:'button',
            text:"Like All",
            style: this.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                self.instabot.likeAll();
            })
            return b;
        })
        return btn;
    }
    getUnfollowersBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'UnfollowersBtn',
            type:'button',
            text:"Find Unfollowers",
            style: this.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',()=>this.getUnfollowersBtnClicked(b))
            return b;
        })
        return btn;
    }
    async getUnfollowersBtnClicked(btn){
        if(!btn.disabled){
            btn.disabled=true;
            btn.innerText = "Progressing..."
            const unfollowers = await this.instabot.getUnfollowers();
            btn.disabled=false;
            btn.innerText = "Find Unfollowers"
        }
    }
    statusBtn(parent){
        const btn = this.createElement({
            id:'StatusBtn',
            type:'button',
            text:"Status ( + )",
            style: this.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',()=>this.statusBtnClicked(b))
            return b;
        })
        return btn;
    }
    statusBtnClicked(btn){
        const popupname = 'StatusPopUp';
        if(btn.className == 'off'){
            const popup = document.getElementById(popupname);
            this.closePopup(popup);
        } else {
            const b = this.instabot;
            b.getStatus();
            const html = `
            <div style="margin-top:30px;">
                <div style="padding:1em;">
                    <h2 style="${this.style.heading}">Status</h2>
                    <h3 style="${this.style.subheading}">Duration:</h3> 
                    <p style="margin-bottom:5px;">${b.time.maxDuration/b.min} min</p>
                    <h3 style="${this.style.subheading}">Filtering Mode:</h3>
                    <p style="margin-bottom:5px;">${b.options.isFiltering}</p>
                    <h3 style="${this.style.subheading}">Following Mode:</h3>
                    <p style="margin-bottom:5px;">${b.options.isFollowing}</p>
                    ${b.options.isFiltering 
                    ? `
                        <h3 style="${this.style.subheading}">Likes limit :</h3>
                        <p style="margin-bottom:5px;">${b.conditions.maxLiked}</p>
                        <h3 style="${this.style.subheading}">Likes max :</h3>
                        <p style="margin-bottom:5px;">${b.conditions.maxLikes}</p>
                        <h3 style="${this.style.subheading}">Likes min :</h3>
                        <p style="margin-bottom:5px;">${b.conditions.minLikes}</p>
                        <h3 style="${this.style.subheading}">Like if :</h3>
                        <p style="margin-bottom:5px;">${b.conditions.include.join(',')}</p>
                        <h3 style="${this.style.subheading}">Don't like if :</h3>
                        <p style="margin-bottom:5px;">${b.conditions.exclude.join(',')}</p>
                        <h3 style="${this.style.subheading}">Image type required to comment  :</h3>
                        <p style="margin-bottom:5px;">${b.conditions.imageAlt.join(',')}</p>
                        <h3 style="${this.style.subheading}">Comment if :</h3>
                        <p style="margin-bottom:5px;">${b.comments.conditions.likeback.join(',') +","+ b.comments.conditions.followback.join(',')}</p>
                    `:`
                        <p style="${this.style.error}">Instabot will like anything but won't follow nor comment</p>
                    `}
                    <h2 style="${this.style.heading}margin-top:1em;">Results</h2>
                    <h3 style="${this.style.subheading}">Current liked:</h3>
                    <p style="margin-bottom:5px;">${b.status.liked.length + b.status.archivedLiked.length}</p>
                    <h3 style="${this.style.subheading}">Current followed:</h3>
                    <p style="margin-bottom:5px;">${b.status.followed.length + b.status.archivedFollowed.length}</p>
                    ${b.status.archivedFollowed.length>0
                    ?`${b.status.archivedFollowed.map((f)=>(
                        `<p><a target="_blank" href="${f.personLink}">${f.personName}</a></p>`
                    ))}`
                    :``}
                    ${b.status.followed.length>0
                    ?`${b.status.followed.map((f)=>(
                        `<p><a target="_blank" href="${f.person.personLink}">${f.person.personName}</a></p>`
                    ))}`
                    :``}
                </div>
            </div>
            `
            this.createPopup(html, popupname, this.style.smallpopup);
        }
        btn.classList.toggle('off');
    }
    myLikedBtn(parent){
        const btn = this.createElement({
            id:'MyLikedBtn',
            type:'button',
            text:"My Likes ( = )",
            style: this.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',()=>this.myLikedBtnClicked(b));
            return b;
        })
        return btn;
    }
    myLikedBtnClicked(btn){
        const popupname = 'MyLikesPopup';
        if(btn.className == 'off'){
            const popup = document.getElementById(popupname);
            this.closePopup(popup);
        } else {
            const liked = [ ...this.instabot.status.liked , ...this.instabot.status.archivedLiked];
            const html = (liked.length>0)
                ?`<ul style="${this.style.ul}">
                    ${liked.map((t)=>( 
                        `<li style="${this.style.li}">
                            <a style="${this.style.person}" href="${t.person.personLink}" target="_blank">
                                <span style=${(t.followed)?this.style.personFollowed:this.style.personNotFollowed}>${(t.followed)?"Followed":"Not Following"}</span>
                                <p>${t.person.personName}</p>
                                <img style="${this.style.personImage}" src="${t.person.personImage}"/>
                            </a>
                            <a style="text-align:center;"href="${t.src}"target="_blank">
                                <img style="${this.style.postImage}" src="${t.image.src}"/>
                            </a>
                            <p style="${this.style.postCommented}">${(t.comment != null)? `Comment: ${t.comment}`:"Not commented"}</p>
                        </li>`
                    )).join('')}
                </ul>
                `
                :`<h1 style="${this.style.heading}text-align:center;">You have not liked any posts yet.</h1>`
            this.createPopup(html,popupname,this.style.popup);
        }
        btn.classList.toggle('off');
    }
    toggleIncludeTopBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleTopBtn',
            type:'button',
            text:"Top Post ( _ )",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',()=>self.toggleIncludeTopBtnClicked(b))
            return b;
        })
        return btn;
    }
    toggleIncludeTopBtnClicked(btn){
        if(btn.className == 'off'){
            this.instabot.toggleIncludeTop();
            btn.innerText = "Top Post ( _ )";
            btn.style = this.style.btn.blue;
        } else {
            this.instabot.toggleIncludeTop();
            btn.innerText = "Recent Post ( _ )";
            btn.style = this.style.btn.red;
        }
        btn.classList.toggle('off');
    }
    toggleFilterBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleFilterBtn',
            type:'button',
            text:"Filter ON ( - )",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',()=>self.toggleFilterBtnClicked(b));
            return b;
        })
        return btn;
    }
    toggleFilterBtnClicked(btn){
        if(btn.className == 'off'){
            this.instabot.toggleFilter();
            btn.innerText="Filter ON ( - )";
            btn.style = this.style.btn.blue;
        } else {
            this.instabot.toggleFilter();
            btn.innerText = "Filter OFF ( - )";
            btn.style = this.style.btn.red;
        }
        btn.classList.toggle('off');
    }
    toggleFollowingBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleFollowingBtn',
            type:'button',
            text:"Following ON ( \| )",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',()=>self.toggleFollowingBtnClicked(b))
            return b;
        })
        return btn;
    }
    toggleFollowingBtnClicked(btn){
        if(btn.className == 'off'){
            this.instabot.toggleFollowing();
            btn.innerText="Following ON ( \| )";
            btn.style = this.style.btn.blue;
        } else {
            this.instabot.toggleFollowing();
            btn.innerText = "Following OFF ( \| )";
            btn.style = this.style.btn.red;
        }
        btn.classList.toggle('off');
    }
    toggleCommentingBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleCommentingBtn',
            type:'button',
            text:"Commenting ON ( \\ )",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',()=>self.toggleCommentingBtnClicked(b))
            return b;
        })
        return btn;
    }
    toggleCommentingBtnClicked(btn){
        if(btn.className == 'off'){
            this.instabot.toggleCommenting();
            btn.innerText="Commenting ON ( \\ )";
            btn.style = this.style.btn.blue;
        } else {
            this.instabot.toggleCommenting();
            btn.innerText = "Commenting OFF ( \\ )";
            btn.style = this.style.btn.red;
        }
        btn.classList.toggle('off');
    }
    toggleLogBoxBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleLogBox',
            type:'button',
            text:"Toggle Log box ( ; )",
            style: self.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',()=>self.toggleLogBoxClicked())
            return b;
        })
        return btn;
    }
    toggleLogBoxClicked(){
        const logger = document.getElementById('LogBox')
        if(logger.style.display != 'none'){
            logger.style.display = 'none';
        } else {
            logger.style.display = 'block';
        }
    }
}
const instabot = new Instabot(options);
const UI = new InstabotUI(instabot);
UI.init()
