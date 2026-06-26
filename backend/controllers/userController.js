const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        gender: true,
        address: true,
        postalCode: true,
        emergencyName: true,
        emergencyPhone: true,
        role: true,
        status: true,
        tribeNumber: true,
        blockchainHash: true,
        createdAt: true,
      },
    });
    
    const mappedUsers = users.map(user => ({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      phone_number: user.phone,
      gender: user.gender,
      address: user.address,
      postal_code: user.postalCode,
      emergency_contact_name: user.emergencyName,
      emergency_contact_phone: user.emergencyPhone,
      role: user.role,
      status: user.status,
      tribe_number: user.tribeNumber,
      on_chain_tx_hash: user.blockchainHash,
      created_at: user.createdAt,
    }));
    
    res.json(mappedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving users.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE', 'SUSPEND', 'REACTIVATE'
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Authorization check
    if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      return res.status(403).json({ error: 'Standard admins cannot modify other administrators.' });
    }

    let updateData = {};

    if (action === 'APPROVE') {
      const year = new Date().getFullYear();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const tribeNumber = `TRB-${year}-${randomId}`;
      const blockchainHash = `0x${crypto.randomBytes(16).toString('hex')}`;
      
      updateData = { status: 'ACTIVE', tribeNumber, blockchainHash };
    } else if (action === 'SUSPEND') {
      updateData = { status: 'SUSPENDED' };
    } else if (action === 'REACTIVATE') {
      updateData = { status: 'ACTIVE' };
    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, status: true, tribeNumber: true, blockchainHash: true }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating status.' });
  }
};

exports.promoteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'admin'
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating role.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Authorization check
    if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      return res.status(403).json({ error: 'Standard admins cannot delete other administrators.' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User permanently deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting user.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Authorization check
    if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'super_admin')) {
      return res.status(403).json({ error: 'Standard admins cannot reset passwords for other administrators.' });
    }
    // Mocking a password reset
    // In production, this would generate a token and send an email
    res.json({ message: 'Password reset link sent to user email successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error triggering password reset.' });
  }
};
