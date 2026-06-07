/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const adminId = uuidv4();
const staffId = uuidv4();
const trainer1Id = uuidv4();
const trainer2Id = uuidv4();
const trainer3Id = uuidv4();
const member1Id = uuidv4();
const member2Id = uuidv4();
const member3Id = uuidv4();
const member4Id = uuidv4();
const member5Id = uuidv4();

const trainerProfile1 = uuidv4();
const trainerProfile2 = uuidv4();
const trainerProfile3 = uuidv4();
const memberProfile1 = uuidv4();
const memberProfile2 = uuidv4();
const memberProfile3 = uuidv4();
const memberProfile4 = uuidv4();
const memberProfile5 = uuidv4();

const now = new Date();

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    const memberPass = await bcrypt.hash('Member@123456', 12);

    // --- Users ---
    await queryInterface.bulkInsert('Users', [
      {
        id: adminId,
        name: 'Alex Morgan',
        email: 'admin@gymms.com',
        password_hash: passwordHash,
        role: 'admin',
        profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: staffId,
        name: 'Jordan Lee',
        email: 'staff@gymms.com',
        password_hash: passwordHash,
        role: 'staff',
        profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: trainer1Id,
        name: 'Marcus Rivera',
        email: 'marcus@gymms.com',
        password_hash: passwordHash,
        role: 'trainer',
        profile_image_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: trainer2Id,
        name: 'Sofia Chen',
        email: 'sofia@gymms.com',
        password_hash: passwordHash,
        role: 'trainer',
        profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: trainer3Id,
        name: 'Darius Thompson',
        email: 'darius@gymms.com',
        password_hash: passwordHash,
        role: 'trainer',
        profile_image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: member1Id,
        name: 'Chris Johnson',
        email: 'chris@example.com',
        password_hash: memberPass,
        role: 'member',
        profile_image_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: member2Id,
        name: 'Emily Watson',
        email: 'emily@example.com',
        password_hash: memberPass,
        role: 'member',
        profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: member3Id,
        name: 'Jake Martinez',
        email: 'jake@example.com',
        password_hash: memberPass,
        role: 'member',
        profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: member4Id,
        name: 'Priya Patel',
        email: 'priya@example.com',
        password_hash: memberPass,
        role: 'member',
        profile_image_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: member5Id,
        name: 'Ryan O\'Brien',
        email: 'ryan@example.com',
        password_hash: memberPass,
        role: 'member',
        profile_image_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
        is_active: false,
        last_login: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // --- Trainers ---
    await queryInterface.bulkInsert('Trainers', [
      {
        id: trainerProfile1,
        user_id: trainer1Id,
        specialization: '{Strength Training,Powerlifting,Nutrition}',
        experience_years: 8,
        bio: 'Certified strength coach with 8 years of experience helping athletes and beginners reach their peak performance.',
        certifications: '{NSCA-CSCS,ACE CPT}',
        hourly_rate: 75.00,
        is_available: true,
        rating: 4.9,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: trainerProfile2,
        user_id: trainer2Id,
        specialization: '{Yoga,Pilates,Flexibility}',
        experience_years: 6,
        bio: 'Yoga and Pilates specialist focused on mindfulness, flexibility, and holistic wellness.',
        certifications: '{RYT-500,ACE CPT,NASM CES}',
        hourly_rate: 65.00,
        is_available: true,
        rating: 4.8,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: trainerProfile3,
        user_id: trainer3Id,
        specialization: '{HIIT,Cardio,Weight Loss}',
        experience_years: 5,
        bio: 'High-energy HIIT trainer dedicated to helping members achieve rapid fat loss and cardiovascular fitness.',
        certifications: '{ACE CPT,Precision Nutrition L1}',
        hourly_rate: 60.00,
        is_available: true,
        rating: 4.7,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // --- Members ---
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    const endDate1 = new Date();
    endDate1.setMonth(endDate1.getMonth() + 9);
    const endDate2 = new Date();
    endDate2.setMonth(endDate2.getMonth() + 6);
    const endDate3 = new Date();
    endDate3.setDate(endDate3.getDate() + 5); // expiring soon
    const endDate4 = new Date();
    endDate4.setMonth(endDate4.getMonth() - 1); // expired

    await queryInterface.bulkInsert('Members', [
      {
        id: memberProfile1,
        user_id: member1Id,
        membership_type: 'premium',
        start_date: startDate,
        end_date: endDate1,
        status: 'active',
        phone: '+1-555-0101',
        emergency_contact: 'Lisa Johnson: +1-555-0102',
        health_notes: 'Mild knee injury - avoid heavy squats',
        assigned_trainer_id: trainerProfile1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: memberProfile2,
        user_id: member2Id,
        membership_type: 'standard',
        start_date: startDate,
        end_date: endDate2,
        status: 'active',
        phone: '+1-555-0201',
        emergency_contact: null,
        health_notes: null,
        assigned_trainer_id: trainerProfile2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: memberProfile3,
        user_id: member3Id,
        membership_type: 'vip',
        start_date: startDate,
        end_date: endDate3,
        status: 'active',
        phone: '+1-555-0301',
        emergency_contact: 'Ana Martinez: +1-555-0302',
        health_notes: null,
        assigned_trainer_id: trainerProfile3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: memberProfile4,
        user_id: member4Id,
        membership_type: 'basic',
        start_date: startDate,
        end_date: endDate2,
        status: 'active',
        phone: '+1-555-0401',
        emergency_contact: null,
        health_notes: 'Vegetarian - nutrition plan needs adjustment',
        assigned_trainer_id: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: memberProfile5,
        user_id: member5Id,
        membership_type: 'basic',
        start_date: startDate,
        end_date: endDate4,
        status: 'expired',
        phone: '+1-555-0501',
        emergency_contact: null,
        health_notes: null,
        assigned_trainer_id: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // --- Payments ---
    const payments = [];
    const months = [0, 1, 2, 3, 4, 5];
    const amounts = { basic: 29.99, standard: 59.99, premium: 99.99, vip: 149.99 };

    months.forEach((m) => {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      d.setDate(1);
      payments.push(
        {
          id: uuidv4(),
          member_id: memberProfile1,
          amount: amounts.premium,
          payment_date: d,
          due_date: null,
          status: 'completed',
          payment_method: 'card',
          description: 'Premium Monthly Membership',
          transaction_id: `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          member_id: memberProfile2,
          amount: amounts.standard,
          payment_date: d,
          due_date: null,
          status: m === 0 ? 'pending' : 'completed',
          payment_method: 'cash',
          description: 'Standard Monthly Membership',
          transaction_id: `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuidv4(),
          member_id: memberProfile3,
          amount: amounts.vip,
          payment_date: d,
          due_date: null,
          status: 'completed',
          payment_method: 'bank_transfer',
          description: 'VIP Monthly Membership',
          transaction_id: `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
          createdAt: now,
          updatedAt: now,
        }
      );
    });

    await queryInterface.bulkInsert('Payments', payments);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Payments', null, {});
    await queryInterface.bulkDelete('Members', null, {});
    await queryInterface.bulkDelete('Trainers', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
