var express = require('express');
const { isLoggedIn } = require("../middleware/validate");
var router = express.Router();
const db = require("../conf/database");

// Create a new comment
router.post("/create", isLoggedIn, async function(req, res, next) {
    try {
        const { postId, commentText } = req.body;
        const userId = req.session.user.id;

        // Validate input
        if (!commentText || commentText.trim() === '') {
            req.flash("error", "Comment cannot be empty!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(400).json({
                    success: false,
                    message: "Comment cannot be empty"
                });
            });
        }

        // Check if post exists
        const [post] = await db.query(
            `SELECT * FROM posts WHERE post_id = ?`,
            [postId]
        );

        if (!post.length) {
            req.flash("error", "Post not found!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(404).json({
                    success: false,
                    message: "Post not found"
                });
            });
        }

        // Insert the comment
        const [result] = await db.query(
            `INSERT INTO comments (text, fk_post_id, fk_user_id) VALUES (?, ?, ?)`,
            [commentText.trim(), postId, userId]
        );

        if (result.affectedRows === 1) {
            // Get the newly created comment with user info for response
            const [newComment] = await db.query(
                `SELECT c.*, u.username 
                 FROM comments c
                 JOIN user u ON c.fk_user_id = u.user_id
                 WHERE c.comment_id = ?`,
                [result.insertId]
            );

            req.flash("success", "Comment added successfully!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(200).json({
                    success: true,
                    comment: newComment[0],
                    message: "Comment added successfully"
                });
            });
        } else {
            req.flash("error", "Failed to add comment!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to add comment"
                });
            });
        }
    } catch (err) {
        console.error('Comment error:', err);
        req.flash("error", "Error adding comment!");
        return req.session.save(err => {
            if (err) next(err);
            return res.status(500).json({
                success: false,
                message: "Error adding comment"
            });
        });
    }
});

// Delete a comment
router.delete("/delete/:commentId", isLoggedIn, async function(req, res, next) {
    try {
        const { commentId } = req.params;
        const userId = req.session.user.id;

        // Check if comment exists and belongs to user
        const [comment] = await db.query(
            `SELECT * FROM comments WHERE comment_id = ? AND fk_user_id = ?`,
            [commentId, userId]
        );

        if (!comment.length) {
            req.flash("error", "Comment not found or unauthorized!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(404).json({
                    success: false,
                    message: "Comment not found or unauthorized"
                });
            });
        }

        // Delete the comment
        const [result] = await db.query(
            `DELETE FROM comments WHERE comment_id = ?`,
            [commentId]
        );

        if (result.affectedRows === 1) {
            req.flash("success", "Comment deleted successfully!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(200).json({
                    success: true,
                    message: "Comment deleted successfully"
                });
            });
        } else {
            req.flash("error", "Failed to delete comment!");
            return req.session.save(err => {
                if (err) next(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete comment"
                });
            });
        }
    } catch (err) {
        console.error('Delete comment error:', err);
        req.flash("error", "Error deleting comment!");
        return req.session.save(err => {
            if (err) next(err);
            return res.status(500).json({
                success: false,
                message: "Error deleting comment"
            });
        });
    }
});

module.exports = router;