class InstaBot {
    constructor(){
        this.s = 1000;
        this.min = 60 * this.s;
        this.hr = 60 * this.min;
        this.time = {
            start: performance.now(),
            delayInitial: 2 * this.s,
            delayLike: 4 * this.s, // Delay to like the image
            delayNext: 3 * this.s, // Delay to load next image
            delayComment: 4 * this.s, // Delay to comment
            maxDuration: 10 * this.min, // Max runtime before the script stops liking
        };
        this.conditions = {
            maxFollows: 15,
            maxLiked: 80,
            minLikes: 20,
            maxLikes : 300,
            isFiltering: true,
            include: [
                '인스타','인친',
                "라이크",'좋아요','좋아요환영','좋아요반사','라이크반사','반사','l4l','like','instalike',
                'follow','followme','맞팔','팔로우','맞팔해요','파로윙',
            ] || [],
            exclude: [
                '10k','20k','30k','10kfollowers','20kfollowers'
            ]
        }
        this.comments = {
            conditions : {
                followback : ['선팔맞팔','맞팔'],
                likeback : ['좋아요반사','라이크반사','좋반']
            },
            comments : {
                followback: ['선팔하구 가요!','선팔했어요!','선팔합니다 :)','맞팔해요:)','맞팔할까요😊'],
                likeback: ['좋반요!','좋아요반사요!','좋반이요 ㅎㅎ']
            }
        }
        this.actions = {
            likes: 0, // Counter used for console logging
            follows:[],
            stopped: false,
        };
        this.element = {
            name : 'a.notranslate:first-child',
            post: "a[href*='/p/']:not(.zV_Nj)",
            recentPost : '.yQ0j1:nth-child(2) ~ div a[href*="/p/"]:not(.zV_Nj)',
            numberOfLikes : `article section div div:last-child button[type=button] span,
                             article section div div:last-child a.zV_Nj span`,
            likeBtn:'article span.glyphsSpriteHeart__outline__24__grey_9.u-__7',
            reply: 'span.EizgU',
            extraReply: 'span.glyphsSpriteCircle_add__outline__24__grey_9.u-__7',
            tags : 'article a[href*="/tags/"]',
            nextBtn: 'a.coreSpriteRightPaginationArrow',
            followBtn: 'button.oW_lN',
            followersBtn : 'a.-nal3, a._81NM2',
            followersOverHidden : '.isgrP',
            followersInnerHeight : 'ul.jSC57._6xe7A',
            followersList: 'a.FPmhX.notranslate._0imsa',
            followerPopupCloseBtn:'span[aria-label="Close"]',
            suggestionsTitle: 'h4._7UhW9',
        }
    }
    check(){
        console.log(`%cDuration? : ${this.time.maxDuration/this.min} min`,'font-size:8px;')
        console.log(`%cFiltering? : ${this.conditions.isFiltering}`,'font-size:8px;')
        if(this.conditions.isFiltering){
            console.log(`%cLike limit ? : ${this.conditions.maxLiked}`,'font-size:8px;')
            console.log(`%cLikes max ? : ${this.conditions.maxLikes} likes`,'font-size:8px;')
            console.log(`%cLikes min ? : ${this.conditions.minLikes} likes`,'font-size:8px;')
            console.log(`%cIncluded Tags? : ${this.conditions.include.join(',')}`,'font-size:8px;')
            console.log(`%cExcluded Tags? : ${this.conditions.exclude.join(',')}`,'font-size:8px;')
            console.log(`%cComment if? : ${this.comments.conditions.likeback.join(',') + this.comments.conditions.followback.join(',')}`,'font-size:8px;')
        } else {
            console.log(`InstaBot will like anything but won't follow nor comment`)
        }
    }
    init(includeTop = true){
        this.actions.stopped = false;
        this.time.start = performance.now();
        if(this.actions.likes > 0){
            console.log(`Resetting likes from ${this.actions.likes} to 0`)
            this.actions.likes = 0;
        }
        if(this.actions.follows.length > 0){
            console.log(`Resetting likes from ${this.actions.likes} to 0`)
            this.actions.follows = [];
        }
        const post = (includeTop)?document.querySelector(this.element.post):document.querySelector(this.element.recentPost)
        post.click(); // Click first image from Top Posts

        const delay = (Math.random()+0.3)*this.time.delayInitial;
        this.waitFor(delay,()=>{
            this.processPost(); // Initial like to start off the chain reaction
        })
    }
    getName(){
        return document.querySelector(this.element.name) != null
            ? {
                personName : document.querySelector(this.element.name).innerText,
                personLink : document.querySelector(this.element.name).href,
            }
            : console.log(`%cCouldn't load name. Retrying...`,'font-size:8px; color:red!important;') 
            && setTimeout(()=>document.querySelector(this.element.name) != null 
                ? {
                    personName : document.querySelector(this.element.name).innerText,
                    personLink : document.querySelector(this.element.name).href,
                }
                : null
                ,delay);
    }
    getNumberOfLikes(){
        return document.querySelector(this.element.numberOfLikes) != null
            ? parseInt(document.querySelector(this.element.numberOfLikes).innerText.replace(',','')) 
            :100;
    }
    checkTags(){
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
        return {
            hasTag,
            hasExcludes,
            hasF4F:hasF4F.length>0,
            hasL4L:hasL4L.length>0,
        }
    }
    processPost(){
        console.log(`%c=======================`,'color:white;');
        const delay = (Math.random()+0.3)*this.time.delayLike;
        this.waitFor(delay, ()=>{
            const { personName, personLink } = this.getName() || {};
            const numberOfLikes = this.getNumberOfLikes();
            console.log(`%c Analyzing %c${personName}`,'color:dodgerblue;font-weight:bold;','background:yellow; text-decoration:underline;');
            console.log(`%c${personLink}`,'font-size:8px;');
            if( personName != null 
                && ((numberOfLikes >= this.conditions.minLikes && numberOfLikes <= this.conditions.maxLikes && this.conditions.isFiltering) 
                || !this.conditions.isFiltering) 
            ){
                const likebtn = document.querySelector(this.element.likeBtn);
                const extraReply = document.querySelectorAll(this.element.extraReply); extraReply? extraReply.forEach((t)=>t.click()):true;
                const reply = document.querySelectorAll(this.element.reply); reply ? reply.forEach((t)=>t.click()):true;
                const tags = this.checkTags();

                if(( tags.hasTag.length > 0 && tags.hasExcludes == 0 && this.conditions.isFiltering ) || !this.conditions.isFiltering){
                    if(likebtn){
                        if(!this.conditions.isFiltering){
                            console.log(`%c Not Filtering:`,'font-size:8px; color:lightgray!important;');
                        } else {
                            console.log(`%cFound matching ${tags.hasTag.length} tags:`,'font-size:8px; color:lightgray!important;', tags.hasTag.join(','));
                            console.log(`%cThis person has ${numberOfLikes} likes.`,'font-size:8px; color:lightgray!important;');
                        }
                        likebtn.click();
                        this.actions.likes++
                        console.log(`%cLike count:  ${this.actions.likes}`, "font-weight:bold; font-style:italic; ");
                        if(this.conditions.isFiltering){
                            this.writeComment(tags);
                        }
                    } else {
                        console.log(`%cAlready liked.`,'font-size:8px; color:red!important;');
                    }
                    this.goToNextImage();
                } else {
                    if(tags.hasExcludes.length > 0){
                        console.log(`%cFound unwanted tags:`,'font-size:8px; color:lightgray!important;', hasExcludes.join(','));
                    } else {
                        console.log(`%cNo Matching tags.`,'font-size:8px; color:red!important;');
                    }
                    this.goToNextImage();
                }
            } else {
                if(personName == null) {
                    console.log(`%c Couldn't load the person`, 'font-size:8px; color:red!important;');
                } else {
                    (numberOfLikes <= this.conditions.minLikes)
                        ?console.log(`%c Too little likes`, 'font-size:8px; color:red!important;'):null;
                    (numberOfLikes >= this.conditions.maxLikes) 
                        ?console.log(`%c Too many likes`, 'font-size:8px; color:red!important;'):null;
                }
                this.goToNextImage();
            }
        });
    }
    goToNextImage(){
        const delay = (Math.random()+0.4)* this.time.delayNext;
        this.waitFor(delay, ()=>{
            // Go to next image
            const el = document.querySelector(this.element.nextBtn);

            if(this.actions.likes >= this.conditions.maxLiked) { 
                console.log(`%cYou have already liked ${this.conditions.maxLiked} images. Restarting will reset`,'font-weight:bold;font-size:8px;');
                this.stop();
            }  

            el ? el.click() : true;
            if(performance.now() - this.time.start < this.time.maxDuration && !this.actions.stopped){
                console.log(`%cAvailable likes Remaining: ${this.conditions.maxLiked - this.actions.likes}`,'color:gray;font-size:6px;font-style:italic');
                console.log(`%cTime remaining: ${ Math.round((this.time.maxDuration - (performance.now() - this.time.start))/this.min*10)/10} minutes`,'color:gray;font-size:6px;font-style:italic');
                this.processPost();
            }
            else{
                console.log(`%c=======================`,'color:white;');
                console.log("%cAll done here...",'font-weight:bold; font-size:14px;color:green;');
                console.log(`%cTotal Like count: ${this.actions.likes} images`, "font-weight:bold; font-size:12px;");
                if(this.actions.follows.length>0){
                    console.log(`%cTotal Follow count: ${this.actions.follows.length}`, "font-weight:bold; font-size:12px;");
                    this.actions.follows.forEach((f)=>{
                        console.log(`%c${f.personName}: ${f.personLink}`, "font-weight:bold; font-size:12px;");
                    })
                }
            }
        });
    }
    async showWhoUnfollowedMe(){
        const following = await this.loadFollowings();
        const followers = await this.loadFollowers();
        const unfollowers = following.filter(function(f){
            return this.indexOf(f) == -1;
        },followers)
        console.log(`You have ${unfollowers.length} people who are not following back:`)
        unfollowers.forEach((f)=>{
            console.log(`%c ${f} :  https://www.instagram.com/${f}`,'font-size:8px;color:grey;')
        })
    }
    async loadFollowings(){
        console.log("Loading user's following list.. Please wait.." );
        return new Promise(async resolve => {
            const flBtn = document.querySelectorAll(this.element.followersBtn);
            flBtn[flBtn.length-1].click();
            const result = await this.fetchPeople();
            resolve(result);
        })
    }
    async loadFollowers(){
        console.log("Loading user's followers... Please wait...");
        return new Promise(async resolve => {
            const flBtn = document.querySelectorAll(this.element.followersBtn);
            flBtn[0].click();
            const result = await this.fetchPeople();
            resolve(result);
        })
    }
    fetchPeople(){
        return new Promise(resolve => {
            this.waitFor(1500,()=>{
                const itvl = setInterval(()=>{
                    const scroll = document.querySelector(this.element.followersOverHidden);
                    const loadedHeight = document.querySelector(this.element.followersInnerHeight).scrollHeight
                    const isLoading = (document.querySelector(this.element.suggestionsTitle))
                    ? scroll.scrollTop != loadedHeight
                    : (document.querySelector('.W1Bne.ztp9m'))?true:scroll.scrollTop + scroll.offsetHeight != loadedHeight 
                    if(isLoading){
                        scroll.scrollTop = loadedHeight;
                    } else {
                        clearInterval(itvl);
                        const list = Array.from(document.querySelectorAll(this.element.followersList)).map((p)=>{
                            return p.innerText
                        })
                        document.querySelector(this.element.followerPopupCloseBtn).click()
                        console.log(`%cFinished collecting`,'font-size:8px;color:grey;');
                        this.waitFor(1000,()=>{
                            resolve(list)
                        })
                    }
                }, 1000)
            })
        })
    }
    follow(hasF4F){
        if(hasF4F && this.conditions.isFiltering){
            const likes = this.getNumberOfLikes();
            if(
                likes >= this.conditions.minLikes && likes <= this.conditions.maxLikes 
                && this.actions.follows.length < this.conditions.maxFollows
            ){
                const person = this.getName();
                const followBtn = document.querySelector(this.element.followBtn)
                followBtn.click();
                this.actions.follows.push(person);
                console.log('%c THIS PERSON HAS BEEN FOLLOWED', 'font-size:8px;font-weight:bold;');
            } else if(this.actions.follows.length >= this.conditions.maxFollows){
                console.log('%c FOLLOW LIMIT EXCEEDED', 'font-size:8px;font-weight:bold;');
            }
        }
    }
    async writeComment({ hasF4F, hasL4L }){
        const f4fcom = this.comments.comments.followback;
        const l4lcom = this.comments.comments.likeback;
        this.follow(hasF4F);
        if(this.conditions.isFiltering && (hasF4F || hasL4L)){
            const input = document.querySelector('.Ypffh'); 
            const lastValue = input.value;
            input.value =
                (hasF4F)
                ? this.generateRandomComment(f4fcom)
                :(hasL4L)
                ? this.generateRandomComment(l4lcom)
                :null;
            const event = new Event('change', { bubbles: true });
            event.simulated = true;
            const tracker = input._valueTracker;
            if (tracker) {
                tracker.setValue(lastValue);
            }
            input.dispatchEvent(event);
            (input.value!=null)? await this.submitComment(): false;
        }
    }
    generateRandomComment(c){
        return c[ Math.floor(Math.random()*c.length) ]
    }
     submitComment(){
         const delay = (Math.random()+0.3)*this.time.delayInitial;
         return new Promise(resolve=>{
             this.waitFor(delay,()=>{
                 resolve(document.querySelector('.X7cDz button').click());
             })
         })
    }
    likeAllOnMyFeed(){
        document.querySelectorAll(this.element.likeBtn).forEach((b)=>{
            b.click()
        })
    }
    toggleFilter(){
        this.conditions.isFiltering = !this.conditions.isFiltering;
        this.conditions.isFiltering
            ? console.log(`%c Filtering turned ON`, 'background:green;color:white!important;')
            : console.log(`%c Filtering turned OFF`, 'background:red;color:white!important;')
    }
    stop(){
        this.actions.stopped = true;
    }
    waitFor(_s, _c){
        setTimeout(_c, _s);
    }
}
const instabot = new InstaBot();
