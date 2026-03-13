const express = require('express');
const router = express.Router();
const { Country } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all countries (public - no auth required for dropdown)
router.get('/', async (req, res) => {
  try {
    const { region } = req.query;
    
    let countries;
    if (region) {
      countries = await Country.findByRegion(region);
    } else {
      countries = await Country.findAll();
    }

    res.json({
      success: true,
      data: { countries }
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching countries.'
    });
  }
});

// Get all regions
router.get('/regions', async (req, res) => {
  try {
    const regions = await Country.getRegions();
    res.json({
      success: true,
      data: { regions }
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching regions.'
    });
  }
});

// Get single country
router.get('/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found.'
      });
    }
    res.json({
      success: true,
      data: { country }
    });
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.'
    });
  }
});

// Create country (Super Admin only)
router.post('/',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    try {
      const { name, code, region } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Name and code are required.'
        });
      }

      // Check if country already exists
      const existing = await Country.findByName(name);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A country with this name already exists.'
        });
      }

      const country = await Country.create({ name, code, region });
      res.status(201).json({
        success: true,
        message: 'Country created successfully.',
        data: { country }
      });
    } catch (error) {
      console.error('Create country error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while creating country.'
      });
    }
  }
);

// Update country (Super Admin only)
router.put('/:id',
  authenticate,
  authorize('Super Admin'),
  async (req, res) => {
    try {
      const { name, code, region, isActive } = req.body;
      const country = await Country.update(req.params.id, { name, code, region, isActive });

      if (!country) {
        return res.status(404).json({
          success: false,
          message: 'Country not found.'
        });
      }

      res.json({
        success: true,
        message: 'Country updated successfully.',
        data: { country }
      });
    } catch (error) {
      console.error('Update country error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while updating country.'
      });
    }
  }
);

module.exports = router;
