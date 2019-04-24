class InstaBot {
    constructor(){
        this.s = 1000;
        this.min = 60 * this.s;
        this.hr = 60 * this.min;
        this.time = {
            start: performance.now(),
            delayInitial: 2 * this.s,
            delayLike: 4 * this.s, // Delay from the image is shown to the image is liked
            delayNext: 3 * this.s, // Delay from the image is liked to the next image is loaded
            maxDuration: 10 * this.min, // Max runtime before the script stops liking
        };
        this.conditions = {
            maxLikes : 300,
            forceLike: false,
            include: [
                '인스타','인친',
                "라이크",'좋아요','좋아요환영','좋아요반사','라이크반사','반사','l4l','like','instalike',
                'follow','followme','맞팔','팔로우','맞팔해요','파로윙',
            ]
        }
        this.actions = {
            likes: 0, // Counter used for console logging
            stopped: false,
        };
        this.element = {
            name : 'a.notranslate:first-child',
            numberOfLikes : 'article section div div:last-child button[type=button] span',
            likeBtn:'article span.glyphsSpriteHeart__outline__24__grey_9.u-__7',
            reply: 'span.EizgU',
            tags : 'article a[href*="/tags/"]',
            nextBtn: 'a.coreSpriteRightPaginationArrow',
        }
    }
    check(){
        console.log(`%cDuration? : ${this.time.maxDuration/this.min} min`,'font-size:15px;')
        console.log(`%cForce Like? : ${this.conditions.forceLike}`,'font-size:15px;')
        console.log(`%cMax Likes? : ${this.conditions.maxLikes}`,'font-size:15px;')
        console.log(`%cTags required? : ${this.conditions.include.join(',')}`,'font-size:15px;')
    }
    init(includeTop = true){
        this.time.start = performance.now();
        this.actions.stopped = false;
        if(includeTop){
            document.querySelector('a[href*="/p/"]').click(); // Click first image from Recent
        } else {
            document.querySelector('.yQ0j1:nth-child(2) ~ div a[href*="/p/"]').click(); // Click first image from Top Posts
        }
        const delay = (Math.random()+0.3)*this.time.delayInitial;
        this.waitFor(delay,()=>{
            this.likeImage(); // Initial like to start off the chain reaction
        })
    }
    getName(){
        return document.querySelector(this.element.name) != null
            ? document.querySelector(this.element.name).innerText
            : console.log(`%cCouldn't load name. Retrying...`,'font-size:8px; color:red;') 
            && setTimeout(()=>document.querySelector(this.element.name) != null ? document.querySelector(this.element.name).innerText : null,delay);
    }
    getNumberOfLikes(){
        return document.querySelector(this.element.numberOfLikes) != null
            ? parseInt(document.querySelector(this.element.numberOfLikes).innerText.replace(',','')) 
            :100;
    }
    likeImage(){
        console.log(`%c=======================`,'color:white;');
        const delay = (Math.random()+0.3)*this.time.delayLike;
        this.waitFor(delay, ()=>{
            const personName = this.getName();
            const numberOfLikes = this.getNumberOfLikes();
            console.log(`%c Analyzing %c${personName}`,'color:dodgerblue;font-weight:bold;','color:black; text-decoration:underline;');
            if( personName != null && 
                ((numberOfLikes < this.conditions.maxLikes && !this.conditions.forceLike) || this.conditions.forceLike) 
            ){
                const self = this;
                const likebtn = document.querySelector(this.element.likeBtn);
                const reply = document.querySelectorAll(this.element.reply); reply ? reply.forEach((t)=>t.click()):true;
                const hasTag = (this.conditions.include.length > 0)
                    ? Array.from(document.querySelectorAll(this.element.tags)).filter(function(w){
                        const foundMatch = this.indexOf(w.innerText.replace('#','')) >= 0;
                        return foundMatch;
                    },this.conditions.include).map((tag)=>{
                        return tag.innerText.replace('#','');
                    })
                    :['SKIPPING TAG CHECK'];
                if(( hasTag.length > 0 && !this.conditions.forceLike ) || this.conditions.forceLike){
                    if(likebtn){
                        if(this.conditions.forceLike){
                            console.log(`%cForce liking:`,'font-size:8px; color:lightgray;');
                        } else {
                            console.log(`%cFound matching ${hasTag.length}tags:`,'font-size:8px; color:lightgray;', hasTag.join(','));
                            console.log(`%cThis person has ${numberOfLikes} likes.`,'font-size:8px; color:lightgray;');
                        }
                        likebtn.click();
                        this.actions.likes++
                        console.log(`%cLike count:  ${this.actions.likes}`, "font-weight:bold; font-style:italic; ");
                    } else {
                        console.log(`%cAlready liked.`,'font-size:8px; color:red;');
                    }
                    this.goToNextImage();
                } else {
                    console.log(`%cNo Matching tags.`,'font-size:8px; color:red;');
                    this.goToNextImage();
                }
            } else {
                if(personName == null) {
                    console.log(`%c Couldn't load the person`, 'font-size:8px; color:red;');
                } else {
                    console.log(`%c Too many likes`, 'font-size:8px; color:red;');
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

            el ? el.click() : true;
            if(performance.now() - this.time.start < this.time.maxDuration && !this.actions.stopped){
                console.log(`%cRun time:  ${Math.round((performance.now() - this.time.start)/this.min*10)/10} minutes`,'color:gray;font-size:8px;font-style:italic');
                this.likeImage();
            }
            else{
                console.log(`%c=======================`,'color:white;');
                console.log("%cAll done here...",'font-weight:bold; font-size:18px;color:green;');
                console.log(`%cTotal Like count: ${this.actions.likes} images`, "font-weight:bold; font-size:15px;");
            }
        });
    }
    stop(){
        this.actions.stopped = true;
    }
    likeAllOnMyFeed(){
        document.querySelectorAll(this.element.likeBtn).forEach((b)=>{
            b.click()
        })
    }
    toggleForce(){
        this.conditions.forceLike = !this.conditions.forceLike;
        console.warn(`Force like all posts? : ${this.conditions.forceLike}`)
    }
    waitFor(_s, _c){
        setTimeout(_c, _s);
    }
}
const instabot = new InstaBot();
