class Instabot {
    constructor(){
        this.s = 1000;
        this.min = 60 * this.s;
        this.hr = 60 * this.min;
        this.time = {
            start: performance.now(),
            delayInitial: 2 * this.s,
            delayLike: 3 * this.s,
            delayComment: 5 * this.s,
            delayFollow: 2 * this.s,
            delayNext: 2 * this.s,
            maxDuration: 10 * this.min,
        };
        this.element = {
            popup: 'div._2dDPU.vCf6V[role=dialog]',
            name : 'a.notranslate:first-child',
            personImage: 'article ._2dbep img',
            image: 'article div[role=button] .KL4Bh img.FFVAD',
            post: "a[href*='/p/']:not(.zV_Nj)",
            postCloseBtn: ".ckWGn",
            recentPost : '.yQ0j1:nth-child(2) ~ div a[href*="/p/"]:not(.zV_Nj)',
            numberOfLikes : `article section div div:last-child button[type=button] span,
                             article section div div:last-child a.zV_Nj span`,
            likeBtn:'article span.glyphsSpriteHeart__outline__24__grey_9.u-__7',
            reply: 'span.EizgU',
            extraReply: 'span.glyphsSpriteCircle_add__outline__24__grey_9.u-__7',
            tags : 'article a[href*="/tags/"]',
            nextBtn: 'a.coreSpriteRightPaginationArrow',
            followBtn: 'button.oW_lN:not(._8A5w5)',
            followersBtn : 'a.-nal3, a._81NM2',
            followersOverHidden : '.isgrP',
            followersInnerHeight : 'ul.jSC57._6xe7A',
            followersList: 'a.FPmhX.notranslate._0imsa',
            followerPopupCloseBtn:'span[aria-label="Close"]',
            followerPopupLoadingIcon : '.W1Bne.ztp9m',
            suggestionsTitle: 'h4._7UhW9',
            commentPostBtn : '.X7cDz button',
        }
        this.status ={
            liked : [],
            followed: [],
            archivedLiked:[],
            archivedFollowed:[],
            unfollowers:[],
            inProgress: false,
        }
        this.options = {
            includeTop : true,
            isFiltering: true,
            isFollowing : true,
        }
        this.conditions = {
            maxFollows: 10,
            maxLiked: 80,
            minLikes: 20,
            maxLikes : 300,
            imageAlt : [ 
                '1 person','people','closeup','selfie',
            ],
            include: [
                '인스타','인친',
                "라이크",'좋아요','좋아요환영','좋아요반사','라이크반사','반사','l4l','like','instalike',
                'follow','followme','맞팔','팔로우','맞팔해요','f4f',
            ] || [],
            exclude: [
                '10k','20k','30k','10kfollowers','20kfollowers',
                '흔남','훈남','셀기꾼',
                '육아스타그램','육아',
                '맛집',
            ]
        }
        this.comments = {
            conditions : {
                followback : ['선팔맞팔','선팔하면맞팔','선팔하면맞팔가요','맞팔'],
                likeback : ['좋아요반사','라이크반사','좋반']
            },
            comments : {
                followback: [
                    '선팔하고 가요! 맞팔해주세용','선팔했습니다아아! 맞팔해용','선팔합니다~ 맞팔해주시꺼죠?',
                    '맞팔해요','맞팔해주세요','맞팔할까요','반가워요! 먼저 팔로우하고 갈게요','먼저 팔로합니다!',
                ],
                likeback: [
                    '피드 잘보구가요','좋아요하구갑니다','안녕하세요 :) 조아요누르고가요','제꺼두 좋아요 눌러주시와요 ㅋㅋ','죠아욧!','굳굳','좋반요!','좋아요반사요!','좋반이요','좋아요 반사왔어요~~',
                ]
            },
            emoji: [ '😊','😛','🤗','😄','🤙','👍','🙌','🙏','' ]
        }
        this.font ={
            heading: 'font-size:12px; font-weight:bold;',
            small : 'font-size:8px;',
            override:'font-size:8px;important;background:rgba(30,144,255,0.3);',
            pass:'font-size:8px;important;background:rgba(0,256,0,0.3);',
            error:'font-size:8px;important;background:rgba(256,0,0,0.3)',
        }
    }
    delay(ms){
        return new Promise(resolve=>setTimeout(resolve,ms))
    }
    generateRandomComment(c){
        return c[Math.floor(Math.random()*c.length)] 
    }
    init(){
        this.status.inProgress = true;
        this.time.start = performance.now();
        this.archive();
        this.openPost()
        console.log(`%c>>>>>>>INITIATING INSTABOT....<<<<<<<`,this.font.heading);
        this.delay(this.time.delayInitial)
            .then(()=> this.analyzePost() )
    }
    archive(){
        if(this.status.liked.length > 0 ){
            this.status.archivedLiked = [...this.status.liked, ...this.status.archivedLiked];
            console.log(`%cArchiving likes`,this.font.small);
            this.status.liked = [];
        }
        if(this.status.followed.length > 0 ){
            this.status.archivedFollowed = [...this.status.followed, ...this.status.archivedFollowed ];
            console.log(`%cArchiving follows`,this.font.small);
            this.status.followed = [];
        }
    }
    stop(){
        console.log(`%c>>>>>>STOPPED<<<<<`,this.font.heading);
        this.status.inProgress = false;
    }
    openPost(){
        if(!document.querySelector(this.element.popup)){
            const post = (this.options.includeTop)
                ? document.querySelector(this.element.post)
                : document.querySelector(this.element.recentPost)
            post.click()
        }
    }
    analyzePost(){
        if(this.status.inProgress){
            console.log(`%c===========================================`,'background:black;');
            this.resetPost()
                .then(()=> this.getName())
                .then(()=> this.getNumberOfLikes())
                .then(()=> this.openHiddenComments())
                .then(()=> this.getTags())
                .then(()=> this.getImage())
                .then(()=> this.checkLiked())
                .then(()=> this.checkFollowed())
                .then(()=> this.validatePost())
                .then((isValid)=> this.processPost(isValid))
                .then(()=> this.delay(this.time.delayNext))
                .then(()=> this.nextImage())
        } else {
            this.nextImage();
        }
    }
    nextImage(){
        if(this.status.liked.length >= this.conditions.maxLiked) { 
            console.log(`%cYou have already liked ${this.conditions.maxLiked} images. Restarting will reset`,this.font.heading);
            this.stop();
        }  
        if(this.status.followed.length >= this.conditions.maxFollows) { 
            console.log(`%cYou have already followed ${this.conditions.maxFollows} followers. Restarting will reset`,this.font.heading);
            this.stop();
        }  
        if(
            this.status.inProgress
            && (performance.now() - this.time.start < this.time.maxDuration)
        ){
            const nextbtn = document.querySelector(this.element.nextBtn);
            nextbtn ? nextbtn.click() : true;
            console.log(`%cLiked ${this.status.liked.length} images`,this.font.small);
            console.log(`%cFollowed ${this.status.followed.length} people`,this.font.small);
            console.log('%c====NEXT====>',this.font.heading);
            this.delay(this.time.delayInitial)
                .then(()=>this.checkEndOfPost())
                .then(()=>this.analyzePost())
        } else {
            console.log(`%cTotal Like count: ${this.status.liked.length} images`,this.font.small);
            console.log(`%cTotal Follow count: ${this.status.followed.length}`,this.font.small);
            console.log(`%c>>>>>>FINISHED<<<<<<`,this.font.heading);
            this.status.followed.forEach((f)=>{
                console.log(`%c${f.person.personName}: ${f.person.personLink}`, "font-weight:bold; font-size:8px;");
            })
        }
    }
    checkEndOfPost(){
        return new Promise(resolve=>{
            if(this.post.src == window.location.href){
                console.log(`%cEnd of posts`,this.font.heading)
                document.querySelector(this.element.postCloseBtn).click();
                var evt = new KeyboardEvent('keydown', {'keyCode':222, 'which':222});
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
                : console.log(`%cCouldn't load name. Retrying...`,'font-size:8px; color:red!important;') 
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
            const isSafe = (alt!=null)
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
    checkFollowed(){
        return new Promise(resolve=>{
            this.post.followbtn = document.querySelector(this.element.followBtn);
            this.post.followed = (this.post.followbtn)?false:true;
            return resolve();
        })
    }
    validatePost(){
        return new Promise(resolve=>{
            const {
                person,
                src,
                tags,
                numberOfLikes,
                liked,
                followed,
            } = this.post;

            if(person == null){
                console.log(`%cCouldn't load the person`, this.font.error)
                return resolve(false);
            } else {
                console.log(`%c ID: ${person.personName}`,this.font.heading)
                console.log(`%c${person.personLink}`,this.font.small)
                console.log(`%cCurrent post : ${src}`,this.font.small)
            }

            if(liked){
                console.log(`%cAlready liked.`,this.font.error);
                return resolve(false);
            } 
            if(!this.options.isFiltering){
                console.log(`%cFiltering OFF. Skipping Validation.`, this.font.small)
                return resolve(true);
            }
            if (followed){
                console.log(`%cAlready followed.`,this.font.error);
                return resolve(false);
            }

            if(numberOfLikes < this.conditions.minLikes){
                console.log(`%cNot enough likes`, this.font.error)
                return resolve(false);
            } else if (numberOfLikes > this.conditions.maxLikes){
                console.log(`%cToo many likes`, this.font.error)
                return resolve(false);
            } else {
                console.log(`%cPassed like filter : ${this.options.minLikes} < ${numberOfLikes} < ${this.options.maxLikes}`,this.font.pass);
            } 

            if( tags.hasTag.length == 0 ){
                console.log(`%cNo Matching tags.`,this.font.error);
                return resolve(false);
            } else if( tags.hasExcludes.length > 0 ){
                const unwantedTags = tags.hasExcludes.join(',');
                console.log(`%cFound unwanted tags:`,this.font.error, unwantedTags);
                return resolve(false);
            } else {
                const wantedTags = tags.hasTag.join(',');
                console.log(`%cFound ${tags.hasTag.length} matching tags:`,this.font.pass, wantedTags);
            } 

            return resolve(true);
        })
    }
    processPost(isValid){
        return new Promise(resolve=>{
            if(isValid && this.status.inProgress){
                console.log(`%c......processing......`,this.font.small);
                (!this.options.isFiltering)
                    ? console.log(`%c Filtering is OFF.`,this.font.override)
                    :null;
                this.likePost()
                    .then(()=> this.writeComment())
                    .then(()=> this.submitComment())
                    .then(()=> this.follow())
                    .then(()=>resolve())
            } else {
                console.log(`%cProcess Skipped`,this.font.error);
                return resolve();
            }
        })
    }
    likePost(){
        return new Promise(resolve=>{
            console.log(`%c..liking post..`,this.font.small);
            this.delay(this.time.delayLike)
                .then(()=>{
                    this.post.likeBtn.click();
                    this.post.liked = true;
                    this.status.liked.push(this.post);
                    console.log(`%cLiked post`,this.font.heading);
                    return resolve();
                })
        })
    }
    writeComment(){
        return new Promise(resolve=>{
            const {
                liked,
                tags,
                image,
            } = this.post;

            if(
                this.options.isFiltering 
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
                    }
                    return resolve();
                } else {
                    console.log(`%cCommenting failed`,this.font.small);
                    return resolve();
                }
            } else {
                (!this.options.isFiltering)
                    ?null
                    :(!liked)
                    ?console.log(`%c Skipping comments. Not liked`,this.font.error)
                    :(!image.isSafe)
                    ?console.log(`%c Skipping comments. Image not safe`,this.font.error)
                    :(!tags.hasF4F && !tags.hasL4L)
                    ?console.log(`%c Skipping comments. Missing required tags`,this.font.error)
                    :null;
                return resolve();
            }
        })
    }
    submitComment(){
        return new Promise(resolve=>{
            if(
                this.options.isFiltering 
                && this.post.comment != null
            ){
                const btn = document.querySelector(this.element.commentPostBtn);
                if(btn){
                    console.log(`%c..posting comment..`,this.font.small)
                    this.delay(this.time.delayComment)
                        .then(()=>{
                            btn.click() 
                            console.log(`%cPosted comment: "${this.post.comment}"`,this.font.heading)
                            return resolve() 
                        })
                } else {
                    console.log(`%cComment button missing`,this.font.error);
                    return resolve();
                }
            }else{
                (!this.options.isFiltering)
                    ?null 
                    :(this.post.comment == null)
                    ? console.log(`%cComment missing`,this.font.error)
                    :null;
                return resolve(false);
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
                && this.options.isFollowing 
                && comment != null 
                && tags.hasF4F
                && !followed
                && this.conditions.maxFollows >= this.status.followed.length
            ){
                console.log(`%c..Following..`,this.font.small);
                this.delay(this.time.delayFollow)
                    .then(()=>{
                        if(followbtn){
                            followbtn.click();
                            this.post.followed = true;
                            this.status.followed.push(this.post);
                            console.log(`%cFollowed: ${this.post.person.personLink}`,this.font.heading);
                            resolve();
                        }
                        resolve();
                    })
            } else {
                (!this.options.isFiltering)
                    ? null
                    :(this.conditions.maxFollows <= this.status.followed.length)
                    ? console.log(`%c Skipping follow. Maximum follows reached`,this.font.error)
                    :(!this.options.isFollowing)
                    ? console.log(`%c Following option turned off`,this.font.override)
                    :(followed)
                    ? console.log(`%c Already following.`,this.font.small)
                    :(!comment)
                    ? console.log(`%c Skipping follow. Not commented`,this.font.error)
                    :(!tags.hasF4F)
                    ? console.log(`%c Skipping follow. Missing required tags.`,this.font.error)
                    :null;
                return resolve();
            }
        })
    }
    getStatus(){
        console.log(this.status);
        console.log(`%c>>>>>STATUS<<<<<`,this.font.heading)
        console.log(`%cDuration? : ${this.time.maxDuration/this.min} min`,this.font.small)
        console.log(`%cFiltering? : ${this.options.isFiltering}`,this.font.small)
        if(this.options.isFiltering){
            console.log(`%cLike limit ? : ${this.conditions.maxLiked}`,this.font.small)
            console.log(`%cLikes max ? : ${this.conditions.maxLikes} likes`,this.font.small)
            console.log(`%cLikes min ? : ${this.conditions.minLikes} likes`,this.font.small)
            console.log(`%cIncluded Tags? : ${this.conditions.include.join(',')}`,this.font.small)
            console.log(`%cExcluded Tags? : ${this.conditions.exclude.join(',')}`,this.font.small)
            console.log(`%cComment if? : ${this.comments.conditions.likeback.join(',') + this.comments.conditions.followback.join(',')}`,this.font.small)
        } else {
            console.log(`%cInstaBot will like anything but won't follow nor comment`,this.font.small)
        }
        console.log(`%cResults`,'font-size:10px;font-weight:bold;')
        console.log(`%c Current liked : ${this.status.liked.length + this.status.archivedLiked.length}`,this.font.small)
        console.log(`%c Current followed : ${this.status.followed.length + this.status.archivedFollowed.length}`,this.font.small)
        if(this.status.archivedFollowed.length>0){
            this.status.archivedFollowed.forEach((f)=>{
                console.log(`%c${f.personName}: ${f.personLink}`,this.font.small);
            })
        }
        if(this.status.followed.length>0){
            this.status.followed.forEach((f)=>{
                console.log(`%c${f.personName}: ${f.personLink}`,this.font.small);
            })
        }
    }
    async getUnfollowers(){
        const following = await this.loadFollowers(true);
        const followers = await this.loadFollowers(false);
        const unfollowers = following.filter(function(f){
            return this.indexOf(f) == -1;
        },followers)
        this.status.unfollowers.push(unfollowers);
        console.log(`%cYou have ${unfollowers.length} people who are not following back:`,this.font.heading)
        unfollowers.forEach((f)=>{
            console.log(`%c ${f} :  https://www.instagram.com/${f}`,this.font.small)
        })
        return unfollowers;
    }
    async loadFollowers(loadingFollowings){
        (loadingFollowings)
            ?console.log(`%c...loading followings...`,this.font.small)
            :console.log(`%c ...loading followers ...`, this.font.small)
        return new Promise(async resolve => {
            const flBtn = document.querySelectorAll(this.element.followersBtn);
            (loadingFollowings)
                ? flBtn[flBtn.length-1].click()
                : flBtn[0].click()
            const result = await this.delay(this.time.delayInitial).then(()=> this.fetchPeople())
            resolve(result);
        })
    }
    fetchPeople(){
        return new Promise(resolve => {
            const itvl = setInterval(()=>{
                const scroll = document.querySelector(this.element.followersOverHidden);
                const loadedHeight = document.querySelector(this.element.followersInnerHeight).scrollHeight
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
                    console.log(`%cFinished collecting`,'font-size:8px;color:grey;');
                    setTimeout(()=>resolve(list),1000)
                }
            }, 1000)
        })
    }
    likeAll(){
        document.querySelectorAll(this.element.likeBtn).forEach((b)=>{
            b.click()
        })
    }
    toggleIncludeTop(){
        this.options.includeTop = !this.options.includeTop;
        this.options.includeTop
            ? console.log(`%c Start from Top`,this.font.pass)
            : console.log(`%c Start from Recent`,this.font.error)
    }
    toggleFilter(){
        this.options.isFiltering = !this.options.isFiltering;
        this.options.isFiltering
            ? console.log(`%c Filtering turned ON`,this.font.pass)
            : console.log(`%c Filtering turned OFF`,this.font.error)
    }
    toggleFollowing(){
        this.options.isFollowing = !this.options.isFollowing;
        this.options.isFollowing
            ? console.log(`%c Following ON`,this.font.pass)
            : console.log(`%c Following OFF`,this.font.error)
    }
}

class InstabotUI {
    constructor(instabot){
        this.instabot = instabot;
        this.style = {
            left : "position:fixed;bottom:10px;left:10px;padding:15px;z-index:99;",
            right: "position:fixed;bottom:10px;right:10px;padding:15px;z-index:99;",
            popup: "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:80%;padding:10px;border-radius:15px;z-index:99;background:white;box-shadow: 0 10px 20px rgba(0,0,0,0.19),0 6px 6px rgba(0,0,0,0.23);",
            popupInner: "overflow:scroll;width:100%;height:100%",
            popupClose: "position:fixed; right:2em; top:1em;border:none;border-radius:5px;color:white;background:black;",
            ul: "display:flex;flex-flow:row wrap;margin-top:40px;box-sizing:border-box;",
            li: "display:flex;flex-flow:column;justify-content:space-between;width:25%;padding:1em;",
            person: "display:flex;justify-content:space-between;align-items:center;flex-flow:row;width:100%;margin-bottom:1em;",
            personImage : "width:50px; height:50px;border-radius:50%;",
            personFollowed: "color:teal;font-size:8px;",
            personNotFollowed: "color:tomato;font-size:8px;",
            postImage: "width:100%; height:auto;",
            postCommented: "font-size:8px;color:grey;",
            btn : {
                blue : "background:dodgerblue;color:white;outline:none;border-radius:5px;border:none;padding:5px 10px;margin-top:5px;",
                red : "background:tomato;color:white;outline:none;border-radius:5px;border:none;padding:5px 10px;margin-top:5px;",
                green : "background:teal;color:white;outline:none;border-radius:5px;border:none;padding:5px 10px;margin-top:5px;",
            }
        }
    }
    init(){
        const left = this.createElement({
            type:"div", text:"", style:this.style.left,
            parent:document.body,
        },el=>el)
        const right = this.createElement({
            type:"div", text:"", style:this.style.right,
            parent:document.body,
        },el=>el)

        const togglefollowbtn = this.toggleFollowingBtn(left);
        const toggleincludebtn = this.toggleIncludeTopBtn(left);
        const togglefilterbtn = this.toggleFilterBtn(left);
        const statusbtn = this.statusBtn(left);
        const showlikedbtn = this.showLiked(left);

        const getunfollowersbtn = this.getUnfollowersBtn(right);
        const likeallbtn = this.likeAllBtn(right);
        const startbtn = this.startBtn(right);

        const self = this;
        document.addEventListener('keydown',function(e){
            if(e.keyCode == '222'){
                e.preventDefault();
                self.startBtnClicked(startbtn);
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
    createPopup(content){
        const popup = this.createElement({
            id:'Popup',
            type:"div",
            text:"",
            style:this.style.popup,
            parent:document.body,
        },p=>{
            const popupInner = this.createElement({
                id:'PopupInner',
                type:"div",
                text:`${content}`,
                style:this.style.popupInner,
                parent:p,
            },pInner=>{
                pInner = this.createElement({
                    id:'PopupClose',
                    type:'button',
                    text:"Close",
                    style:this.style.popupClose,
                    parent:pInner,
                },pbtn=>{
                    pbtn.addEventListener('click',function(){
                        p.parentNode.removeChild(p); 
                        return p;
                    })
                })
            })
            return p;
        })
        return popup;
    }
    startBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'StartBtn',
            type:'button',
            text:"Start instabot (')",
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
            btn.innerText="Start instabot (')";
            btn.style = this.style.btn.green;
        } else {
            this.instabot.init();
            btn.innerText = "Stop instabot (')";
            btn.style = this.style.btn.red;
        }
        btn.classList.toggle('started');
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
            b.addEventListener('click',async function(){
                const unfollowers = await self.instabot.getUnfollowers();
                const html = `
                <ul style="margin-top:40px;">
                    ${unfollowers.map((t)=>( 
                        `<li style="padding:1em;">
                            <a href="https://www.instagram.com/${t}" target="_blank">https://www.instagram.com/${t}</a>
                        </li>`
                    )).join('')}
                </ul>
                `
                self.createPopup(html);
            })
            return b;
        })
        return btn;
    }
    statusBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'StatusBtn',
            type:'button',
            text:"Status",
            style: this.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                self.instabot.getStatus();
            })
            return b;
        })
        return btn;
    }
    showLiked(parent){
        const self = this;
        const btn = this.createElement({
            id:'ShowLikedBtn',
            type:'button',
            text:"Show Liked",
            style: this.style.btn.green,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                const liked = [ ...self.instabot.status.liked , ...self.instabot.status.archivedLiked];
                const html = `
                <ul style="${self.style.ul}">
                    ${liked.map((t)=>( 
                        `<li style="${self.style.li}">
                            <div style="${self.style.person}">
                                <span style=${(t.followed)?self.style.personFollowed:self.style.personNotFollowed}>${(t.followed)?"Followed":"Not Following"}</span>
                                <a href="${t.person.personLink}" target="_blank">${t.person.personName}</a>
                                <img style="${self.style.personImage}" src="${t.person.personImage}"/>
                            </div>
                            <a href="${t.src}" target="_blank">
                                <img style="${self.style.postImage}" src="${t.image.src}"/>
                            </a>
                            <p style="${self.style.postCommented}">${(t.comment != null)? `Comment: ${t.comment}` :"Not commented"}</p>
                        </li>`
                    )).join('')}
                </ul>
                `
                self.createPopup(html);
            })
            return b;
        })
        return btn;
    }
    toggleIncludeTopBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleTopBtn',
            type:'button',
            text:"From Top",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                if(this.className == 'off'){
                    self.instabot.toggleIncludeTop();
                    this.innerText="From Top";
                    this.style = self.style.btn.blue;
                } else {
                    self.instabot.toggleIncludeTop();
                    this.innerText = "From Recent";
                    this.style = self.style.btn.red;
                }
                this.classList.toggle('off');
            })
            return b;
        })
        return btn;
    }
    toggleFilterBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleFilterBtn',
            type:'button',
            text:"Filter ON",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                if(this.className == 'off'){
                    self.instabot.toggleFilter();
                    this.innerText="Filter ON";
                    this.style = self.style.btn.blue;
                } else {
                    self.instabot.toggleFilter();
                    this.innerText = "Filter OFF";
                    this.style = self.style.btn.red;
                }
                this.classList.toggle('off');
            })
            return b;
        })
        return btn;
    }
    toggleFollowingBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ToggleFollowingBtn',
            type:'button',
            text:"Following ON",
            style: self.style.btn.blue,
            parent,
        },b=>{
            b.addEventListener('click',function(){
                if(this.className == 'off'){
                    self.instabot.toggleFollowing();
                    this.innerText="Following ON";
                    this.style = self.style.btn.blue;
                } else {
                    self.instabot.toggleFollowing();
                    this.innerText = "Following OFF";
                    this.style = self.style.btn.red;
                }
                this.classList.toggle('off');
            })
            return b;
        })
        return btn;
    }
}

const instabot = new Instabot();
const UI = new InstabotUI(instabot);
UI.init()
clear();
