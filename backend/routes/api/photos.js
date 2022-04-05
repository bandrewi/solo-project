const express = require('express');
const asyncHandler = require('express-async-handler');
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { Photo } = require('../../db/models');
const { requireAuth, restoreUser } = require('../../utils/auth');

const router = express.Router();

validatePhoto = [
    check('imageUrl')
        .isURL()
        .withMessage('Please provide a valid image URL.'),
    check('content')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a description for your image.'),
    handleValidationErrors
]

//Get photos
router.get('/', asyncHandler(async (req, res) => {
    const photos = await Photo.findAll({
        limit: 10,
        //could possibly add other filters like most favorited, most recent etc
    })

    return res.json({ photos });
}))

//Get photo
router.get('/:id(\\d+)', requireAuth, asyncHandler(async (req, res) => {
    const id = req.params.id;
    const photo = await Photo.findByPk(id);

    return res.json({ photo });
}))

//Upload(create) photo
router.post('/new', restoreUser, requireAuth, validatePhoto, asyncHandler(async (req, res) => {
    const { imageUrl, content } = req.body;
    const { id } = req.user
    //console.log('------------------------------ID', id)
    const photo = await Photo.create({
        userId: id,
        imageUrl,
        content
    });

    return res.json({ photo });
}))

//Update photo
router.put('/:id(\\d+)/edit', requireAuth, validatePhoto, asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { imageUrl, content } = req.body
    const photo = await Photo.findByPk(id);

    photo.imageUrl = imageUrl;
    photo.content = content;
    await photo.save();

    return res.json({ photo });
}))

//Delete photo
router.delete('/:id(\\d+)/delete', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const photo = await Photo.findByPk(id)

    await photo.destroy();

    return res.json({ message: 'success' })
}))

module.exports = router