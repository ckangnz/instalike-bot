class Instabot {
    constructor(){
        this.s = 1000;
        this.min = 60 * this.s;
        this.hr = 60 * this.min;
        this.time = {
            start: performance.now(),
            delayInitial: 2 * this.s,
            delayLike: 3 * this.s,
            delayNext: 4 * this.s,
            delayComment: 4 * this.s,
            maxDuration: 10 * this.min,
        };
        this.element = {
            popup: 'div._2dDPU.vCf6V[role=dialog]',
            name : 'a.notranslate:first-child',
            image: 'article div[role=button] .KL4Bh img.FFVAD',
            post: "a[href*='/p/']:not(.zV_Nj)",
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
        this.options = {
            includeTop : true,
        }
        this.conditions = {
            isFollowing : true,
            includeTop: true,
            maxFollows: 15,
            maxLiked: 80,
            minLikes: 20,
            maxLikes : 300,
            isFiltering: true,
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
        }
    }
    delay(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
    init(){
        this.openPost()
        this.delay(2000)
            .then(()=> this.analyzePost() )
    }
    openPost(){
        if(!document.querySelector(this.element.popup)){
            const post = (this.options.includeTop)
                ? document.querySelector(this.element.post)
                : document.querySelector(this.element.recentPost)
            post.click();
        }
    }
    analyzePost(){
        console.log(`%c==========START=============`,'background:black;');
        this.resetPost()
            .then(()=> this.getName())
            .then(()=> this.openHiddenComments())
            .then(()=> this.getNumberOfLikes())
            .then(()=> this.getTags())
            .then(()=> this.getImageAlt())
            .then(()=> this.validatePost())
            .then((isValid)=> this.processPost(isValid))
            .then(()=> this.delay(this.time.delayNext))
            .then(()=> this.nextImage())
    }
    nextImage(){
        const nextbtn = document.querySelector(this.element.nextBtn);
        nextbtn ? nextbtn.click() : true;
        this.delay(this.time.delayInitial)
            .then(()=>this.analyzePost())
    }
    resetPost(){
        return new Promise(resolve=>{
            this.post = {};
            resolve();
        })
    }
    getName(){
        this.post.person = document.querySelector(this.element.name) != null
            ? {
                personName : document.querySelector(this.element.name).innerText,
                personLink : document.querySelector(this.element.name).href,
            }
            : console.log(`%cCouldn't load name. Retrying...`,'font-size:8px; color:red!important;') 
            && this.waitFor(delay,()=>document.querySelector(this.element.name) != null 
                ? {
                    personName : document.querySelector(this.element.name).innerText,
                    personLink : document.querySelector(this.element.name).href,
                }
                : null
            );
    }
    getTags(){
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
    }
    openHiddenComments(){
        const extraReply = document.querySelectorAll(this.element.extraReply); 
        extraReply? extraReply.forEach((t)=>t.click()):true;
        const reply = document.querySelectorAll(this.element.reply);
        reply ? reply.forEach((t)=>t.click()):true;
    }
    getNumberOfLikes(){
        this.post.numberOfLikes = document.querySelector(this.element.numberOfLikes) != null
            ? parseInt(document.querySelector(this.element.numberOfLikes).innerText.replace(',','')) 
            :0;
    }
    getImageAlt(){
        const image = document.querySelector(this.element.image); 
        const alt = image ? image.alt : null
        const isSafe = (alt!=null)
            ?  this.conditions.imageAlt.some((v)=> {
                return alt.indexOf(v) >= 0;
            })
            :null
        this.post.image = {
            alt, isSafe
        }
    }
    validatePost(){
        return new Promise(resolve=>{
            console.log(this.post);
            const { person, tags, numberOfLikes } = this.post;
            if(!this.conditions.isFiltering){
                console.log(`%cFiltering OFF. Validation Skipping.`, this.font.small)
                resolve(true);
            }
            if(person == null){
                console.log(`%cCouldn't load the person`, this.font.small)
                resolve(false);
            }
            console.log(`%c Analyzing ${person.personName}`,this.font.heading)
            console.log(`%c${person.personLink}`,this.font.small)

            if(numberOfLikes < this.conditions.minLikes){
                console.log(`%cNot enough likes`, this.font.small)
                resolve(false);
            } else if (numberOfLikes > this.conditions.maxLikes){
                console.log(`%cToo many likes`, this.font.small)
                resolve(false);
            }
            console.log(`%cThis person has ${numberOfLikes} likes.`,this.font.small);

            if( tags.hasTag.length == 0 ){
                console.log(`%cNo Matching tags.`,this.font.small);
                resolve(false);
            }
            const wantedTags = tags.hasTag.join(',');
            console.log(`%cFound matching ${tags.hasTag.length} tags:`,this.font.small, wantedTags);

            if( tags.hasExcludes.length > 0 ){
                const unwantedTags = tags.hasExcludes.join(',');
                console.log(`%cFound unwanted tags:`,this.font.small, unwantedTags);
                resolve(false);
            }
            resolve(true);
        })
    }
    processPost(isValid){
        return new Promise(resolve=>{
            if(isValid){
                this.writeComment()
                resolve()
            } else {
                resolve();
            }
        })
    }
    writeComment(){
        return new Promise(resolve=>{
            if(this.conditions.isFiltering){
                console.log('Writing comments......');
                resolve()
            } else {
                console.log(`%cNot filtering! Skipping comments`,this.font.small);
                resolve();
            }
        })
    }
}
const instabot = new Instabot();
instabot.init();
