const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-cave-tribe';

exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, gender, address, postalCode, emergencyName, emergencyPhone, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Super admin backdoor for local development testing
    let role = 'member';
    let status = 'PENDING';
    if (email.startsWith('super@')) {
      role = 'super_admin';
      status = 'ACTIVE';
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        gender,
        address,
        postalCode,
        emergencyName,
        emergencyPhone,
        passwordHash,
        role,
        status,
      },
    });

    res.status(201).json({ message: 'User registered successfully. Awaiting admin approval.', user: { id: newUser.id, email: newUser.email, status: newUser.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Check status
    if (user.status === 'PENDING') {
      return res.status(403).json({ error: 'Account is pending administrator approval.' });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Account has been suspended.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userForFrontend = {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      phone_number: user.phone,
      gender: user.gender,
      address: user.address,
      emergency_contact_name: user.emergencyName,
      emergency_contact_phone: user.emergencyPhone,
      tribe_number: user.tribeNumber,
      status: user.status,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    res.json({ token, user: userForFrontend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};
