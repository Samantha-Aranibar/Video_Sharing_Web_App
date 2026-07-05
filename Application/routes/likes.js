var express = require('express');
const { isLoggedIn } = require("../middleware/validate");
var router = express.Router();
const db = require("../conf/database");

router.post('/create', isLoggedIn, async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.session.user.id;

        // Check if post exists
        const [post] = await db.query(
            `SELECT post_id FROM post WHERE post_id = ?`,
            [postId]
        );

        if (!post.length) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if like already exists (using your schema's column names)
        const [existingLike] = await db.query(
            `SELECT likes_id FROM likes 
             WHERE fk_post_id = ? AND fk_user_id = ?`,
            [postId, userId]
        );

        if (existingLike.length > 0) {
            // Unlike - delete the existing like
            await db.query(
                `DELETE FROM likes WHERE likes_id = ?`,
                [existingLike[0].likes_id]
            );

            // Get updated like count
            const [likeCount] = await db.query(
                `SELECT COUNT(*) as count FROM likes 
                 WHERE fk_post_id = ?`,
                [postId]
            );

            return res.status(200).json({
                success: true,
                action: 'unliked',
                likes: likeCount[0].count,
                message: 'Post unliked successfully'
            });
        } else {
            // Like - create new like record
            await db.query(
                `INSERT INTO likes (fk_post_id, fk_user_id) 
                 VALUES (?, ?)`,
                [postId, userId]
            );

            // Get updated like count
            const [likeCount] = await db.query(
                `SELECT COUNT(*) as count FROM likes 
                 WHERE fk_post_id = ?`,
                [postId]
            );

            return res.status(200).json({
                success: true,
                action: 'liked',
                likes: likeCount[0].count,
                message: 'Post liked successfully'
            });
        }
    } catch (err) {
        console.error('Like error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to process like action'
        });
    }
});

// Helper function to count likes for a post
async function countLikes(postId) {
    const [result] = await db.query(
        `SELECT COUNT(*) as count FROM likes 
         WHERE fk_post_id = ?`,
        [postId]
    );
    return result[0].count;
}

// Helper function to check if user liked a post
async function checkUserLike(postId, userId) {
    const [result] = await db.query(
        `SELECT likes_id FROM likes 
         WHERE fk_post_id = ? AND fk_user_id = ?`,
        [postId, userId]
    );
    return result.length > 0;
}

module.exports = router;