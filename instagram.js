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
        };
    }
    check(){
        console.log(`%cDuration? : ${this.time.maxDuration/this.min} min`,'font-size:15px;')
        console.log(`%cForce Like? : ${this.conditions.forceLike}`,'font-size:15px;')
        console.log(`%cMax Likes? : ${this.conditions.maxLikes}`,'font-size:15px;')
        console.log(`%cTags required? : ${this.conditions.include.join(',')}`,'font-size:15px;')
    }
    init(includeTop = true){
        this.time.start = performance.now();
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
    likeImage(){
        console.log(`%c=======================`,'color:white;');
        const delay = (Math.random()+0.3)*this.time.delayLike;
        this.waitFor(delay, ()=>{
            const personName = document.querySelector('a.notranslate:first-child').innerText;
            const numberOfLikes = document.querySelector('article section div div:last-child button[type=button] span') != null
                ? parseInt(document.querySelector('article section div div:last-child button[type=button] span').innerText.replace(',','')) 
                :100;
            console.log(`%c Analyzing ${personName}`,'color:dodgerblue;font-weight:bold;');
            if((numberOfLikes < this.conditions.maxLikes && !this.conditions.forceLike) || this.conditions.forceLike ){
                const self = this;
                const likebtn = document.querySelector('article span.glyphsSpriteHeart__outline__24__grey_9.u-__7');
                const reply = document.querySelectorAll('.EizgU'); reply ? reply.forEach((t)=>t.click()):true;
                const hasTag = (this.conditions.include.length > 0)
                    ? Array.from(document.querySelectorAll('article a[href*="/tags/"]')).filter(function(w){
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
                        console.log(`%cLike count:  ${this.actions.likes}`, "font-weight:bold; font-style:italic; ");
                        likebtn.click();
                        this.actions.likes++
                    } else {
                        console.log(`%cAlready liked.`,'font-size:8px; color:red;');
                    }
                    this.goToNextImage();
                } else {
                    console.log(`%cNo Matching tags.`,'font-size:8px; color:red;');
                    this.goToNextImage();
                }
            } else {
                console.log(`%c Too many likes`, 'font-size:8px; color:red;');
                this.goToNextImage();
            }
        });
    }
    goToNextImage(){
        const delay = (Math.random()+0.4)* this.time.delayNext;
        this.waitFor(delay, ()=>{
            // Go to next image
            const el = document.querySelector('a.coreSpriteRightPaginationArrow');

            el ? el.click() : true;
            if(performance.now() - this.time.start < this.time.maxDuration){
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
    waitFor(_s, _c){
        setTimeout(_c, _s);
    }
    likeAllOnMyFeed(){
        document.querySelectorAll('button .glyphsSpriteHeart__outline__24__grey_9.u-__7').forEach((item)=>{
            item.click()
        })
    }
    toggleForce(){
        this.conditions.forceLike = !this.conditions.forceLike;
        console.warn(`Force like all posts? : ${this.conditions.forceLike}`)
    }
}
var instabot = new InstaBot();
