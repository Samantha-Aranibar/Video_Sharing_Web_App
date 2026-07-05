const express = require('express');
const router = express.Router();
const multer = require('multer');
const {isLoggedIn} = require ('../middleware/validate');
const {makeThumbnail, getPostById, getCommentsByPostId} = require (`../middleware/post`)
const db = require ("../conf/database");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/videos/uploads') // Directory to store uploaded videos
  },
  filename: function (req, file, cb) {
    let fileExt = file.mimetype.split("/")[1]; // Get the file extension from the mimetype
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`) // Create a unique filename
  }
});

const upload = multer({ storage: storage });

router.post(`/create`, isLoggedIn, upload.single(`videoUpload`), makeThumbnail, async function (req, res, next) {
  try {
    console.log('1. Starting post creation...');
    
    // 1. Verify session and user ID
    if (!req.session.user) {
      console.error('2. No user in session!');
      req.flash('error', 'You must be logged in');
      return res.redirect('/login');
    }
    
    const userId = req.session.user.id || req.session.user.userId;
    console.log('3. Using user ID:', userId);

    // 2. Validate inputs
    if (!req.file) {
      console.error('4. No file uploaded');
      req.flash('error', 'No video uploaded');
      return res.redirect('/postvideo');
    }
    console.log('5. File uploaded:', req.file.path);

    const {title, description} = req.body;
    if (!title || !description) {
      console.error('6. Missing title/description');
      req.flash('error', 'Title and description required');
      return res.redirect('/postvideo');
    }

    // 3. Prepare paths (convert Windows paths if needed)
    const videoFilename= req.file.path;
    const thumbnailFilename = req.file.thumbnail ? req.file.thumbnail : null;

    // 4. Database insertion
    console.log('7. Attempting database insert...');
    const [result] = await db.execute(
      `INSERT INTO post (title, description, video, thumbnail, fk_user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, videoFilename, thumbnailFilename, userId]   //thumbnailPath videoPath
    );
    console.log('8. Insert result:', result);

    if (result.affectedRows === 1) {
      console.log('9. Post created successfully!');
      req.flash('success', 'Video posted successfully!');
      return res.redirect(`/post/${result.insertId}`);
    } else {
      console.error('10. No rows affected');
      throw new Error('Database insert failed');
    }
  } catch (err) {
    console.error('11. ERROR:', err);
    console.error('12. Error details:', {
      message: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code
    });
    req.flash('error', 'Failed to create post: ' + err.message);
    return res.redirect('/viewpost');
  }
});

router.get('/:id(\\d+)', async function(req, res, next) {
  console.log("View post by ID AA1");
  try {
    const [post] = await db.execute(`
      SELECT p.*, u.username 
      FROM post p
      JOIN user u ON p.fk_user_id = u.user_id
      WHERE p.post_id = ?`,
      [req.params.id]
    );
    
    if (!post.length) {
      req.flash('error', 'Post not found');
      return res.redirect('/viewpost');
    }

    // Normalize video path for web
    const normalizedVideo = post[0].video.replace(/\\/g, '/');
    console.log("View video AA", post[0]);
    res.render('viewpostid', {
      post: { 
        ...post[0],
        created_at: new Date(post[0].created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      isLoggedIn: req.session.user ? true : false,
      user: req.session.user || null
    });
  } catch (err) {
    console.error('Post view error:', err);
    req.flash('error', 'Error loading video');
    res.redirect('/viewpost');
  }
});


/** /viewpost */
router.get('/viewpost', async function(req, res, next) {
  console.log("View post AA");
  try {
    const [posts] = await db.execute(`
      SELECT 
        p.post_id,
        p.title,
        p.description,
        p.video,
        p.thumbnail,
        p.created_at,
        u.username
      FROM post p
      JOIN user u ON p.fk_user_id = u.user_id
      ORDER BY p.created_at DESC
    `);

    // Normalize paths for web display
    const normalizedPosts = posts.map(post => ({
      ...post,
      video: `${post.video}`,
      thumbnail: post.thumbnail ? `${post.thumbnail}` : null
    }));

    res.render('viewpost', {
      title: 'All Videos',
      posts: normalizedPosts || [],
      isSearchResults: false,
      css: ['viewpost.css'],
      js: ['viewpost.js'],
      isLoggedIn: req.session.user ? true : false
    });

  } catch (err) {
    console.error('Error fetching videos:', err);
    req.flash('error', 'Could not load videos');
    res.render('viewpost', {
      title: 'All Videos',
      posts: [],
      isSearchResults: false,
      isLoggedIn: req.session.user ? true : false
    });
  }
});

router.delete('/:id(\\d+)', isLoggedIn, async function(req,res,next){
  try{
    const {id} = req.params;
    const userId = req.session.user.id;

    const [post] = await db.query(
    'SELECT fk_user_id FROM post WHERE post_id = ?', [id]);
    
    if (!post.length) {
      return res.static(404).json({
        success: false,
        message: `Post not found!`
      });
    } 
    if (post[0].fk_user_id !== userId) {
      return res.status(403).json ({
        success: false,
        message: "Unauthorized. You can only dekete your own posts"
      });
    }
    const [videoInfo] = await db.query(
      `DELETE FROM post WHERE post_id = ?`, [id]
    );
   
    res.status(200).json ({
      success: true,
      message: `Post deleted successfully!`
    });
  }catch{
    console.error(`Delete post error: `,err);
    next(err);
  }
});


router.get("/search", async function (req, res, next) {
    try {
        const searchQuery = req.query.q?.trim();
        
        if (!searchQuery || searchQuery.length < 2) {
            req.flash('error', 'Please enter at least 2 characters');
            return res.redirect('/viewpost');
        }

        const searchTerm = `%${searchQuery}%`;
        
        const [posts] = await db.query(`
            SELECT p.*, u.username 
            FROM post p
            JOIN user u ON p.fk_user_id = u.user_id
            WHERE p.title LIKE ? OR p.description LIKE ?
            ORDER BY p.created_at DESC
        `, [searchTerm, searchTerm]);

        res.render('viewpost', {
            title: `Search Results for "${searchQuery}"`,
            posts,
            searchQuery,
            isSearchResults: true,
            css: ['viewpost.css'],
            js: ['viewpost.js']
        });

    } catch (err) {
        console.error('Search error:', err);
        req.flash('error', 'Search failed');
        res.redirect('/viewpost');
    }
});


module.exports = router;