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
            maxDuration: 5 * this.min,
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
            logs:[],
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
                '흔남','훈남','오늘의훈남','셀기꾼',
                '육아스타그램','육아','육아그램',
                '고딩','18','19','고1','고2','고3',
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
                    '맞팔해요','맞팔해여엇!','맞팔해주세여','맞팔할까욧','반가워요! 먼저 팔로우하고 갈게요','먼저 팔로합니다!',
                ],
                likeback: [
                    '피드 잘보구가요','좋아요하구갑니다','안녕하세요 :) 조아요누르고가요','제꺼두 좋아요 눌러주시와요 ㅋㅋ','죠아욧!','굳굳','좋반요!','좋아요반사요!','좋반이요','좋아요 반사왔어요~~',
                ]
            },
            emoji: [ '😊','😛','🤗','😄','🤙','👍','🙌','🙏',':)',':D',';)','' ]
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
        this.logger(`>>>>>>>INITIATING INSTABOT....<<<<<<<`,this.font.heading);
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
        this.logger(`....stopping the process... please wait....`,this.font.small);
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
            this.logger(`===========================================`,'background:black;');
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
            this.logger(`You have already liked ${this.conditions.maxLiked} images. Restarting will reset`,this.font.heading);
            this.stop();
        }  
        if(this.status.followed.length >= this.conditions.maxFollows) { 
            this.logger(`You have already followed ${this.conditions.maxFollows} followers. Restarting will reset`,this.font.heading);
            this.stop();
        }  
        if(
            this.status.inProgress
            && (performance.now() - this.time.start < this.time.maxDuration)
        ){
            const nextbtn = document.querySelector(this.element.nextBtn);
            nextbtn ? nextbtn.click() : true;
            this.logger(`Liked ${this.status.liked.length} images. (max:${this.conditions.maxLiked})`,this.font.small);
            this.logger(`Followed ${this.status.followed.length} people (max:${this.conditions.maxFollows})`,this.font.small);
            this.logger(`Time remaining: ${ Math.round((this.time.maxDuration - (performance.now() - this.time.start))/this.min*10)/10} minutes`,this.font.small);
            this.logger('====NEXT====>',this.font.heading);
            this.delay(this.time.delayInitial)
                .then(()=>this.checkEndOfPost())
                .then(()=>this.analyzePost())
        } else {
            this.logger(`Total Like count: ${this.status.liked.length} images`,this.font.small);
            this.logger(`Total Follow count: ${this.status.followed.length}`,this.font.small);
            this.logger(`>>>>>>FINISHED<<<<<<`,this.font.heading);
            this.status.followed.forEach((f)=>{
                this.logger(`<a target="_blank" href="${f.person.personLink}">${f.person.personName}</a> `,this.font.small);
            })
            document.querySelector(this.element.postCloseBtn).click();
        }
    }
    checkEndOfPost(){
        return new Promise(resolve=>{
            if(this.post.src == window.location.href){
                this.logger(`End of posts`,this.font.heading)
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
                this.logger(`Couldn't load the person`, this.font.error)
                return resolve(false);
            } else {
                this.logger(`ID: <a target="_blank" href="${person.personLink}">${person.personName}</a>`,this.font.heading)
                this.logger(`Current post: <a target="_blank" href=${src}"">${src}</a>`,this.font.small)
            }

            if(liked){
                this.logger(`Already liked.`,this.font.error);
                return resolve(false);
            } 
            if(!this.options.isFiltering){
                this.logger(`Filtering OFF. Skipping Validation.`, this.font.small)
                return resolve(true);
            }
            if (followed){
                this.logger(`Already followed.`,this.font.error);
                return resolve(false);
            }

            if(numberOfLikes < this.conditions.minLikes){
                this.logger(`Not enough likes`, this.font.error)
                return resolve(false);
            } else if (numberOfLikes > this.conditions.maxLikes){
                this.logger(`Too many likes`, this.font.error)
                return resolve(false);
            } else {
                this.logger(`Passed like filter : ${this.options.minLikes} < ${numberOfLikes} < ${this.options.maxLikes}`,this.font.pass);
            } 

            if( tags.hasTag.length == 0 ){
                this.logger(`No Matching tags.`,this.font.error);
                return resolve(false);
            } else if( tags.hasExcludes.length > 0 ){
                const unwantedTags = tags.hasExcludes.join(',');
                this.logger(`Found unwanted tags:${unwantedTags}`,this.font.error);
                return resolve(false);
            } else {
                const wantedTags = tags.hasTag.join(',');
                this.logger(`Found ${tags.hasTag.length} matching tags:${wantedTags}`,this.font.pass);
            } 

            return resolve(true);
        })
    }
    processPost(isValid){
        return new Promise(resolve=>{
            if(isValid && this.status.inProgress){
                this.logger(`......processing......`,this.font.small);
                (!this.options.isFiltering)
                    ? this.logger(`Filtering is OFF.`,this.font.override)
                    :null;
                this.likePost()
                    .then(()=> this.writeComment())
                    .then(()=> this.submitComment())
                    .then(()=> this.follow())
                    .then(()=>resolve())
            } else {
                this.logger(`Process Skipped`,this.font.error);
                return resolve();
            }
        })
    }
    likePost(){
        return new Promise(resolve=>{
            this.logger(`..liking post..`,this.font.small);
            this.delay(this.time.delayLike)
                .then(()=>{
                    this.post.likeBtn.click();
                    this.post.liked = true;
                    this.status.liked.push(this.post);
                    this.logger(`Liked post`,this.font.heading);
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
                    this.logger(`Commenting failed`,this.font.small);
                    return resolve();
                }
            } else {
                (!this.options.isFiltering)
                    ?null
                    :(!liked)
                    ?this.logger(`Skipping comments. Not liked`,this.font.error)
                    :(!image.isSafe)
                    ?this.logger(`Skipping comments. Image not safe`,this.font.error)
                    :(!tags.hasF4F && !tags.hasL4L)
                    ?this.logger(`Skipping comments. Missing required tags`,this.font.error)
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
                    this.logger(`..posting comment..`,this.font.small)
                    this.delay(this.time.delayComment)
                        .then(()=>{
                            btn.click() 
                            this.logger(`Posted comment: "${this.post.comment}"`,this.font.heading)
                            return resolve() 
                        })
                } else {
                    this.logger(`Comment button missing`,this.font.error);
                    return resolve();
                }
            }else{
                (!this.options.isFiltering)
                    ?null 
                    :(this.post.comment == null)
                    ? this.logger(`Comment missing`,this.font.error)
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
                this.logger(`..Following..`,this.font.small);
                this.delay(this.time.delayFollow)
                    .then(()=>{
                        if(followbtn){
                            followbtn.click();
                            this.post.followed = true;
                            this.status.followed.push(this.post);
                            this.logger(`Followed: <a target="_blank" href="${this.post.person.personLink}">${this.post.person.personLink}</a>`,this.font.heading);
                            resolve();
                        }
                        resolve();
                    })
            } else {
                (!this.options.isFiltering)
                    ? null
                    :(this.conditions.maxFollows <= this.status.followed.length)
                    ? this.logger(`Skipping follow. Maximum follows reached`,this.font.error)
                    :(!this.options.isFollowing)
                    ? this.logger(`Following option turned off`,this.font.override)
                    :(followed)
                    ? this.logger(`Already following.`,this.font.small)
                    :(!comment)
                    ? this.logger(`Skipping follow. Not commented`,this.font.error)
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
        const following = await this.loadFollowers(true);
        const followers = await this.loadFollowers(false);
        const unfollowers = following.filter(function(f){
            return this.indexOf(f) == -1;
        },followers)
        this.status.unfollowers.push(unfollowers);
        this.logger(`You have ${unfollowers.length} people who are not following back:`,this.font.heading)
        unfollowers.forEach((f)=>{
            this.logger(`${f} :  https://www.instagram.com/${f}`,this.font.small)
        })
        return unfollowers;
    }
    async loadFollowers(loadingFollowings){
        (loadingFollowings)
            ?this.logger(`...loading followings...`,this.font.small)
            :this.logger(`...loading followers ...`, this.font.small)
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
                    this.logger(`Finished collecting`,'font-size:8px;color:grey;');
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
            ? this.logger(`Start from Top`,this.font.pass)
            : this.logger(`Start from Recent`,this.font.error)
    }
    toggleFilter(){
        this.options.isFiltering = !this.options.isFiltering;
        this.options.isFiltering
            ? this.logger(`Filtering turned ON`,this.font.pass)
            : this.logger(`Filtering turned OFF`,this.font.error)
    }
    toggleFollowing(){
        this.options.isFollowing = !this.options.isFollowing;
        this.options.isFollowing
            ? this.logger(`Following ON`,this.font.pass)
            : this.logger(`Following OFF`,this.font.error)
    }
}
class InstabotUI {
    constructor(instabot){
        this.instabot = instabot;
        this.style = {
            left : "position:fixed;bottom:10px;left:10px;padding:15px;z-index:99;",
            right: "position:fixed;bottom:10px;right:10px;padding:15px;z-index:99;",
            logger: "position:fixed;bottom:10px;left:50%;transform:translateX(-50%);width:60%;overflow-y:auto;height:200px;padding:15px;background:white;z-index:99;border-radius:5px;resize:vertical;",
            popup: "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:80%;padding:10px;border-radius:15px;z-index:99;background:white;box-shadow: 0 10px 20px rgba(0,0,0,0.19),0 6px 6px rgba(0,0,0,0.23);",
            popupInner: "overflow:auto;width:100%;height:100%",
            popupClose: "position:fixed; right:2em; top:1em;border:none;border-radius:5px;color:white;background:black;",
            ul: "display:flex;flex-flow:row wrap;margin-top:40px;box-sizing:border-box;",
            li: "display:flex;flex-flow:column;justify-content:space-between;width:25%;padding:1em;box-sizing:border-box;",
            person: "display:flex;justify-content:space-between;align-items:center;flex-flow:row;width:100%;margin-bottom:1em;",
            personImage : "width:50px; height:50px;border-radius:50%;",
            personFollowed: "color:teal;font-size:8px;",
            personNotFollowed: "color:tomato;font-size:8px;",
            postImage: "width:100%;min-width:30px;min-height:30px;background:lightgrey;height:auto;",
            postCommented: "font-size:8px;color:grey;",
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

        const togglefollowbtn = this.toggleFollowingBtn(left);
        const toggleincludebtn = this.toggleIncludeTopBtn(left);
        const togglefilterbtn = this.toggleFilterBtn(left);
        const statusbtn = this.statusBtn(left);
        const showlikedbtn = this.showLikedBtn(left);
        const clearlogbtn = this.clearLogBtn(left);

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
    clearLogBtn(parent){
        const self = this;
        const btn = this.createElement({
            id:'ClearLogBtn',
            type:'button',
            text:"Clear logs",
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
                const b = self.instabot;
                b.getStatus();
                const html = `
                <div style="margin-top:30px;">
                    <div style="padding:1em;">
                        <h2 style="${self.style.heading}">Status</h2>
                        <h3 style="${self.style.subheading}">Duration:</h3> 
                        <p style="margin-bottom:5px;">${b.time.maxDuration/b.min} min</p>
                        <h3 style="${self.style.subheading}">Filtering Mode:</h3>
                        <p style="margin-bottom:5px;">${b.options.isFiltering}</p>
                        <h3 style="${self.style.subheading}">Following Mode:</h3>
                        <p style="margin-bottom:5px;">${b.options.isFollowing}</p>
                        ${b.options.isFiltering 
                        ? `
                            <h3 style="${self.style.subheading}">Likes limit :</h3>
                            <p style="margin-bottom:5px;">${b.conditions.maxLiked}</p>
                            <h3 style="${self.style.subheading}">Likes max :</h3>
                            <p style="margin-bottom:5px;">${b.conditions.maxLikes}</p>
                            <h3 style="${self.style.subheading}">Likes min :</h3>
                            <p style="margin-bottom:5px;">${b.conditions.minLikes}</p>
                            <h3 style="${self.style.subheading}">Comment if :</h3>
                            ${b.comments.conditions.likeback.join(',') + b.comments.conditions.followback.join(',')}
                        `:`
                            <p style="${self.style.error}">Instabot will like anything but won't follow nor comment</p>
                        `}
                        <h2 style="${self.style.heading}margin-top:2em;">Results</h2>
                        <h3 style="${self.style.subheading}">Current liked:</h3>
                        <p style="margin-bottom:5px;">${b.status.liked.length + b.status.archivedLiked.length}</p>
                        <h3 style="${self.style.subheading}">Current followed:</h3>
                        <p style="margin-bottom:5px;">${b.status.followed.length + b.status.archivedFollowed.length}</p>
                        ${b.status.archivedFollowed.length>0
                        ?`${b.status.archivedFollowed.map((f)=>(
                            `<p><a target="_blank" href="${f.personLink}">${f.personName}</a></p>`
                        ))}`
                        :``}
                        ${b.status.followed.length>0
                        ?`${b.status.followed.map((f)=>(
                            `<p><a target="_blank" href="${f.personLink}">${f.personName}</a></p>`
                        ))}`
                        :``}
                    </div>
                </div>
                `
                self.createPopup(html);
            })
            return b;
        })
        return btn;
    }
    showLikedBtn(parent){
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
                            <a style="text-align:center;"href="${t.src}"target="_blank">
                                <img style="${self.style.postImage}" src="${t.image.src}"/>
                            </a>
                            <p style="${self.style.postCommented}">${(t.comment != null)? `Comment: ${t.comment}`:"Not commented"}</p>
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
