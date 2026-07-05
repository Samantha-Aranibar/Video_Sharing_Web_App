var pathToFFMPEG = require("ffmpeg-static");
const { nextTick } = require("process");
var promisify = require('util').promisify; // need to install with npm i ffmpeg-static
var exec = promisify(require("child_process").exec);
const db = require ("../conf/database");


module.exports = {
  makeThumbnail: async function (req, res, next) {
    if (!req.file) {
        next(new Error("File upload failed"));
    } else {
        try {
            var destinationOfThumbnail = `public/images/uploads/thumbnail-${
                req.file.filename.split(".")[0]
            }.png`;
            var thumbnailCommand = `"${pathToFFMPEG}" -ss 00:00:01 -i ${req.file.path} -y -s 200x200 -vframes 1 -f image2 ${destinationOfThumbnail}`;
            var {stdout, stderr} = await exec(thumbnailCommand);
            console.log(stderr);
            console.log(stderr);
            req.file.thumbnail = destinationOfThumbnail;
            next();
        } catch (error) {
            next(error);
        }
    }
  },
  getRecentPosts: async function (req, res, next){
    try {
        const [posts] = await db.execute(`
        SELECT p.*, u.username 
        FROM post p
        JOIN user u ON p.fk_user_id = u.user_id
        ORDER BY p.created_at DESC
        LIMIT 10
        `);
    
        res.locals.recentPosts = posts || [];
        next();
    } catch (err) {
        console.error('Error fetching recent posts:', err);
        res.locals.recentPosts = [];
        next();
    }
  },
  getPostById: async function (req, res, next) {
    try {
        const postId = req.params.id || req.body.postId;
        if (!postId) return next();
        
        const [post] = await db.execute(`
        SELECT p.*, u.username 
        FROM post p
        JOIN user u ON p.fk_user_id = u.user_id
        WHERE p.post_id = ?
        `, [postId]);

        if (post.length) {
        res.locals.currentPost = {
            ...post[0],
            video: post[0].video.replace(/\\/g, '/')
        };
        }
        next();
    } catch (err) {
        console.error('Error fetching post:', err);
        next(err);
    }
  },
  getCommentsByPostId: async function (req, res, next){
    try {
        if (!res.locals.currentPost) return next();
        
        const [comments] = await db.execute(`
        SELECT c.*, u.username 
        FROM comment c
        JOIN user u ON c.fk_user_id = u.user_id
        WHERE c.fk_post_id = ?
        ORDER BY c.created_at DESC
        `, [res.locals.currentPost.post_id]);

        res.locals.currentPost.comments = comments || [];
        next();
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.locals.currentPost.comments = [];
        next();
    }
  },
  getPostByUserId: async function (req, res, next) {
    try {
        const userId = req.params.userId || req.session.user?.id;
        if (!userId) return next();
        
        const [posts] = await db.execute(`
        SELECT p.*, u.username 
        FROM post p
        JOIN user u ON p.fk_user_id = u.user_id
        WHERE p.fk_user_id = ?
        ORDER BY p.created_at DESC
        `, [userId]);

        res.locals.userPosts = posts || [];
        next();
    } catch (err) {
        console.error('Error fetching user posts:', err);
        res.locals.userPosts = [];
        next();
    }
    }
}