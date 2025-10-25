import prisma from './config/database';
import { hashPassword } from './utils/password';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário admin
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@impulso.com' },
      update: {},
      create: {
        email: 'admin@impulso.com',
        password: adminPassword,
        name: 'Administrador',
        role: 'ADMIN',
      },
    });
    console.log('✅ Usuário admin criado:', admin.email);

    // Criar usuário atendente
    const attendantPassword = await hashPassword('atendente123');
    const attendant = await prisma.user.upsert({
      where: { email: 'atendente@impulso.com' },
      update: {},
      create: {
        email: 'atendente@impulso.com',
        password: attendantPassword,
        name: 'Atendente',
        role: 'ATTENDANT',
      },
    });
    console.log('✅ Usuário atendente criado:', attendant.email);

    // Criar categorias
    const categories = [
      { name: 'Suporte Técnico', description: 'Problemas técnicos e de sistema', color: '#3B82F6' },
      { name: 'Financeiro', description: 'Questões financeiras e cobranças', color: '#10B981' },
      { name: 'Comercial', description: 'Dúvidas sobre produtos e vendas', color: '#8B5CF6' },
      { name: 'Infraestrutura', description: 'Problemas de rede e infraestrutura', color: '#F59E0B' },
      { name: 'Outros', description: 'Outros assuntos', color: '#6B7280' },
    ];

    for (const cat of categories) {
      const category = await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
      console.log('✅ Categoria criada:', category.name);
    }

    // Criar SLAs
    const techCategory = await prisma.category.findUnique({ where: { name: 'Suporte Técnico' } });
    const finCategory = await prisma.category.findUnique({ where: { name: 'Financeiro' } });

    const slas = [
      {
        name: 'SLA Urgente',
        categoryId: techCategory?.id,
        responseTime: 30, // 30 minutos
        resolutionTime: 240, // 4 horas
        priority: 'URGENT' as const,
      },
      {
        name: 'SLA Alta',
        categoryId: techCategory?.id,
        responseTime: 60, // 1 hora
        resolutionTime: 480, // 8 horas
        priority: 'HIGH' as const,
      },
      {
        name: 'SLA Normal',
        categoryId: null,
        responseTime: 120, // 2 horas
        resolutionTime: 1440, // 24 horas
        priority: 'MEDIUM' as const,
      },
      {
        name: 'SLA Baixa',
        categoryId: null,
        responseTime: 240, // 4 horas
        resolutionTime: 2880, // 48 horas
        priority: 'LOW' as const,
      },
    ];

    for (const sla of slas) {
      const createdSLA = await prisma.sLA.create({
        data: sla,
      });
      console.log('✅ SLA criado:', createdSLA.name);
    }

    // Criar clientes de exemplo
    const clients = [
      {
        name: 'Empresa ABC Ltda',
        email: 'contato@empresaabc.com',
        phone: '(11) 98765-4321',
        document: '12.345.678/0001-90',
        address: 'Rua Exemplo, 123 - São Paulo, SP',
      },
      {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 91234-5678',
        document: '123.456.789-00',
        address: 'Av. Principal, 456 - Rio de Janeiro, RJ',
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(21) 99876-5432',
        document: '987.654.321-00',
        address: 'Rua das Flores, 789 - Belo Horizonte, MG',
      },
    ];

    for (const client of clients) {
      const createdClient = await prisma.client.create({
        data: client,
      });
      console.log('✅ Cliente criado:', createdClient.name);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('Admin: admin@impulso.com / admin123');
    console.log('Atendente: atendente@impulso.com / atendente123');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
