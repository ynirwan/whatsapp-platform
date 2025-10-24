const { WhatsAppAccount, Contact } = require('../models');
const logger = require('../utils/logger');

// Example controller functions for contacts

exports.createContact = async (req, res) => {
  try {
    const { accountId, phoneNumber, name, email, tags, customFields } = req.body;

    // Verify account belongs to user
    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'WhatsApp account not found' });
    }

    // Create a new contact
    const contact = await Contact.create({
      accountId,
      phoneNumber,
      name,
      email,
      tags,
      customFields
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    logger.error('Create contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { accountId } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'WhatsApp account not found' });
    }

    const contacts = await Contact.findAll({
      where: { accountId }
    });

    res.json({ success: true, data: contacts });
  } catch (error) {
    logger.error('Get contacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
};

exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'WhatsApp account not found' });
    }

    const contact = await Contact.findOne({
      where: { id, accountId }
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    logger.error('Get contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact' });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId, ...updateData } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'WhatsApp account not found' });
    }

    const contact = await Contact.findOne({
      where: { id, accountId }
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await contact.update(updateData);

    res.json({ success: true, data: contact });
  } catch (error) {
    logger.error('Update contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId } = req.query;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'WhatsApp account not found' });
    }

    const contact = await Contact.findOne({
      where: { id, accountId }
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await contact.destroy();

    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    logger.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
};

exports.importContacts = async (req, res) => {
  try {
    const { accountId, contacts } = req.body;

    const account = await WhatsAppAccount.findOne({
      where: { id: accountId, userId: req.user.id }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'WhatsApp account not found' });
    }

    // Batch create contacts for account
    const createdContacts = await Contact.bulkCreate(
      contacts.map(contact => ({
        ...contact,
        accountId
      }))
    );

    res.status(201).json({ success: true, data: createdContacts });
  } catch (error) {
    logger.error('Import contacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to import contacts' });
  }
};

