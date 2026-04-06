import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const seedDatabase = async () => {
  const daysSnap = await getDocs(collection(db, 'eventDays'));
  if (!daysSnap.empty) {
    return false; // Already seeded
  }

  const batch = writeBatch(db);

  // 1. Add Days
  const daysData = [
    { id: 'day1', date: '2026-04-21', location: 'Praça do CEU e Casa de Cultura', description: 'Dia 1 - Abertura' },
    { id: 'day2', date: '2026-04-22', location: 'Unisul', description: 'Dia 2 - Inovação e Criatividade' },
    { id: 'day3', date: '2026-04-23', location: 'Unisul', description: 'Dia 3 - Encerramento' }
  ];
  
  const dayRefs: Record<string, string> = {};
  daysData.forEach(day => {
    const ref = doc(collection(db, 'eventDays'));
    dayRefs[day.id] = ref.id;
    batch.set(ref, { date: day.date, location: day.location, description: day.description });
  });

  // 2. Add Activities
  const activitiesData = [
    // Day 1 - Casa de Cultura
    { dayId: 'day1', title: 'Meditação Do Coração', description: 'Vanessa Leticia Da Silva Torquato De Souza', startTime: '09:00', endTime: '10:00', type: 'atividade_educativa', location: 'Sala de Dança 2' },
    { dayId: 'day1', title: 'Yoga', description: 'Francielle Silva Cruz', startTime: '09:00', endTime: '10:00', type: 'atividade_educativa', location: 'Sala de Artes' },
    { dayId: 'day1', title: 'Cho & O Branding Do Pertencimento...', description: 'Carla Mager', startTime: '09:00', endTime: '10:00', type: 'palestra', location: 'Sala Bento Nascimento' },
    { dayId: 'day1', title: 'Poesia E Autoconhecimento...', description: 'Mariana Maurici', startTime: '10:00', endTime: '11:00', type: 'palestra', location: 'Sala de Artes' },
    { dayId: 'day1', title: 'Stress Experience', description: 'Rafael Libanio Da Silva', startTime: '10:00', endTime: '11:00', type: 'palestra', location: 'Sala Bento Nascimento' },
    { dayId: 'day1', title: 'Desenho Livre: Linha em Estado de Pausa', description: 'Estela Ribeiro', startTime: '11:00', endTime: '12:00', type: 'workshop', location: 'Sala de Artes' },
    { dayId: 'day1', title: 'Reprogramarser', description: 'Alcina Antunes', startTime: '14:30', endTime: '15:30', type: 'palestra', location: 'Sala de Dança 1' },
    { dayId: 'day1', title: 'Palestra Com Danças', description: 'Jaque Bastos', startTime: '14:30', endTime: '15:30', type: 'palestra', location: 'Sala de Dança 2' },
    { dayId: 'day1', title: 'Oficina De Biblioterapia', description: 'Daniella Haendchen Santos', startTime: '14:15', endTime: '15:15', type: 'workshop', location: 'Sala de Dança 3' },
    { dayId: 'day1', title: 'As Influências Do Som; Respirasom', description: 'Carlos Henrique Dias', startTime: '14:15', endTime: '15:15', type: 'experiencia_cultural', location: 'Pátio' },
    { dayId: 'day1', title: 'Desenho (Com O Lado Direito Do Cerebro)', description: 'Marcelo Urizar', startTime: '16:30', endTime: '17:30', type: 'workshop', location: 'Sala de Artes' },
    { dayId: 'day1', title: 'Oficina Teatral', description: 'Osmar João André Junior', startTime: '16:30', endTime: '17:30', type: 'workshop', location: 'Sala Bento Nascimento' },
    { dayId: 'day1', title: 'Dança Que Conecta', description: 'Wanne De Almeida Pereira', startTime: '17:30', endTime: '18:30', type: 'experiencia_cultural', location: 'Sala de Dança 3' },
    { dayId: 'day1', title: 'Conexão 047 Apresenta: Breaking', description: 'Denis Ferreira Moraes', startTime: '18:30', endTime: '19:30', type: 'experiencia_cultural', location: 'Sala de Dança 3' },
    { dayId: 'day1', title: 'Dança que Conecta Mundos', description: 'Frida Fritsney', startTime: '20:15', endTime: '21:15', type: 'experiencia_cultural', location: 'Sala de Dança 3' },

    // Day 2 - Unisul
    { dayId: 'day2', title: 'Crianças Criativas = Futuro Inovador', description: 'Milena Colussi Teixeira', startTime: '09:00', endTime: '10:00', type: 'palestra', location: 'Sala 307' },
    { dayId: 'day2', title: 'Desafios são oportunidades', description: 'Cristine Marla Nasato', startTime: '10:00', endTime: '11:00', type: 'palestra', location: 'Sala 304' },
    { dayId: 'day2', title: 'O que te trava não é falta de talento', description: 'Aline Vicz e Caroline Burin', startTime: '10:00', endTime: '11:00', type: 'palestra', location: 'Sala 308' },
    { dayId: 'day2', title: 'A mente criativa', description: 'Héderson Cassimiro', startTime: '11:00', endTime: '12:00', type: 'palestra', location: 'Sala 303' },
    { dayId: 'day2', title: 'Performance Sustentável com Criatividade', description: 'Leandro Meirelles', startTime: '13:30', endTime: '14:30', type: 'palestra', location: 'Sala 202' },
    { dayId: 'day2', title: 'Cultura Disney', description: 'Jackson Gil Mello Capelari', startTime: '14:00', endTime: '15:00', type: 'palestra', location: 'Sala 303' },
    { dayId: 'day2', title: 'Como Desenvolver A Sua Comunicação Se Divertindo', description: 'Isaura Maria Longo', startTime: '14:00', endTime: '15:00', type: 'workshop', location: 'Sala 304' },
    { dayId: 'day2', title: 'Tesouros Do Oceano Azul', description: 'Kátia Naomi Kuroshima e Camila Burigo Marin', startTime: '15:00', endTime: '16:00', type: 'palestra', location: 'Sala 202' },
    { dayId: 'day2', title: 'Marketing No Empreendedorismo Feminino', description: 'Jennifer Oliveira', startTime: '15:15', endTime: '16:15', type: 'palestra', location: 'Sala 308' },
    { dayId: 'day2', title: 'Trabalhar Muito Nunca Foi Sinônimo De Trabalhar Bem', description: 'Michelle Calbusch', startTime: '16:00', endTime: '17:00', type: 'palestra', location: 'Sala 304' },
    { dayId: 'day2', title: 'Projeto Crescer', description: 'Miriam Rocha', startTime: '16:00', endTime: '17:00', type: 'palestra', location: 'Sala 309' },
    { dayId: 'day2', title: 'Criatividade: Quando A Criança Interior Tem Espaço Para Existir', description: 'Ludmila Lima', startTime: '16:30', endTime: '17:30', type: 'palestra', location: 'Sala 307' },
    { dayId: 'day2', title: 'Criatividade Em Comunidade', description: 'Victoria Marques', startTime: '19:00', endTime: '20:00', type: 'palestra', location: 'Sala 105' },
    { dayId: 'day2', title: 'A Criatividade Do Encontro', description: 'João Pedro Oliveira Moreira', startTime: '19:00', endTime: '20:00', type: 'palestra', location: 'Sala 107' },
    { dayId: 'day2', title: 'Empreendedor do Futuro', description: 'Maria Helena Lourenço Sabino Dos Santos Lopes', startTime: '19:00', endTime: '20:00', type: 'palestra', location: 'Sala 307' },
    { dayId: 'day2', title: 'Do Planejamento ao Movimento Criativo', description: 'Carlos Henrique Chaves Da Rocha e Douglas Aguirre', startTime: '19:30', endTime: '20:30', type: 'palestra', location: 'Sala 313' },
    { dayId: 'day2', title: 'Sua História com Enredo de Vitórias', description: 'Ana Lavratti', startTime: '20:00', endTime: '21:00', type: 'palestra', location: 'Sala 105' },
    { dayId: 'day2', title: 'Torne-se Quem Você Tem Medo de Ser', description: 'Francisco Morais', startTime: '20:00', endTime: '21:00', type: 'palestra', location: 'Sala 107' },

    // Day 3 - Unisul
    { dayId: 'day3', title: 'Você Existe no Digital ou Só Está Lá?', description: 'Marcos Rodrigues', startTime: '14:00', endTime: '15:00', type: 'palestra', location: 'Sala 102' },
    { dayId: 'day3', title: 'Captação De Conteúdo Pelo Celular', description: 'Haylin Rodrigues', startTime: '14:00', endTime: '15:00', type: 'workshop', location: 'Sala 304' },
    { dayId: 'day3', title: 'Desbravando Novos Horizontes Na Literatura', description: 'Maria Denise Mesadri Giorgi', startTime: '14:00', endTime: '15:00', type: 'palestra', location: 'Sala 307' },
    { dayId: 'day3', title: 'Pare de Só Conhecer Pessoas...', description: 'Suelen Machado e Veridiana Nascimento', startTime: '14:15', endTime: '15:15', type: 'palestra', location: 'Sala 315' },
    { dayId: 'day3', title: 'O Impacto Da Inteligência Artificial Na Educação', description: 'Bruno Cavalli Bleichvel', startTime: '15:00', endTime: '16:00', type: 'palestra', location: 'Sala 102' },
    { dayId: 'day3', title: 'Do Medo A Câmera', description: 'Letícia Kmiecik Albano', startTime: '15:15', endTime: '16:15', type: 'palestra', location: 'Sala 309' },
    { dayId: 'day3', title: 'Comunicação que posiciona', description: 'Amanda Zopelaro e Eluana Mello', startTime: '16:00', endTime: '17:00', type: 'palestra', location: 'Sala 315' },
    { dayId: 'day3', title: 'O Cérebro Criativo', description: 'Luciana De Oliveira Gonçalves', startTime: '16:15', endTime: '17:15', type: 'palestra', location: 'Sala 304' },
    { dayId: 'day3', title: 'A Ideia Certa Faz As Pessoas Comprarem De Você', description: 'Maria Paula Colatto', startTime: '16:00', endTime: '17:00', type: 'palestra', location: 'Sala 308' },
    { dayId: 'day3', title: 'Oficina De Produção De Conteúdo Para As Redes Sociais', description: 'Cardume Criativo', startTime: '16:45', endTime: '17:45', type: 'workshop', location: 'Sala 309' },
    { dayId: 'day3', title: 'Criatividade + Ia Na Educação Corporativa', description: 'Helena Mateus', startTime: '19:00', endTime: '20:00', type: 'palestra', location: 'Sala 304' },
    { dayId: 'day3', title: 'IA Não Substitui Criatividade. Amplifica', description: 'Matheus Rodrigues dos Santos e Simone Alves Ferreira', startTime: '19:15', endTime: '20:15', type: 'palestra', location: 'Sala 308' },
    { dayId: 'day3', title: 'Palestra: Criatividade Sobre Pressão', description: 'Janaína Mateus', startTime: '20:00', endTime: '21:00', type: 'palestra', location: 'Sala 304' }
  ];

  activitiesData.forEach(act => {
    const ref = doc(collection(db, 'activities'));
    batch.set(ref, {
      title: act.title,
      description: act.description,
      startTime: act.startTime,
      endTime: act.endTime,
      type: act.type,
      location: act.location,
      dayId: dayRefs[act.dayId]
    });
  });

  // 3. Add Volunteers
  const volunteersData = [
    { name: 'Barbara Duarte', role: 'volunteer', email: 'barbara@wcd.com' },
    { name: 'Ju Chuang', role: 'volunteer', email: 'ju@wcd.com' },
    { name: 'Gabe Altemman', role: 'volunteer', email: 'gabe@wcd.com' },
    { name: 'Carlos Xavier', role: 'volunteer', email: 'carlos@wcd.com' },
    { name: 'Nicole Pereira', role: 'volunteer', email: 'nicole@wcd.com' },
    { name: 'Tawan', role: 'volunteer', email: 'tawan@wcd.com' },
    { name: 'Kethellin de Fá', role: 'volunteer', email: 'kethellin@wcd.com' },
    { name: 'Priscila Vanel', role: 'volunteer', email: 'priscila@wcd.com' },
    { name: 'Maria Anieli Rigotti', role: 'volunteer', email: 'maria.anieli@wcd.com' },
    { name: 'Sariane Caigara', role: 'volunteer', email: 'sariane@wcd.com' },
    { name: 'Rayra Dias', role: 'volunteer', email: 'rayra@wcd.com' },
    { name: 'Jenifer Machado', role: 'volunteer', email: 'jenifer@wcd.com' },
    { name: 'Elisângela Saiz', role: 'volunteer', email: 'elisangela@wcd.com' },
    { name: 'Wellington de Almeida', role: 'volunteer', email: 'wellington@wcd.com' },
    { name: 'Lara Junckes', role: 'volunteer', email: 'lara@wcd.com' },
    { name: 'Maria Helena de Boer', role: 'volunteer', email: 'maria.helena@wcd.com' },
    { name: 'Matheus Gomes', role: 'volunteer', email: 'matheus@wcd.com' },
    { name: 'Amanda Mattos', role: 'volunteer', email: 'amanda@wcd.com' },
    { name: 'Ana Paula Vieira', role: 'volunteer', email: 'ana.paula@wcd.com' },
    { name: 'Márcia Santos', role: 'volunteer', email: 'marcia@wcd.com' },
    { name: 'Keroliny Silva', role: 'volunteer', email: 'keroliny@wcd.com' },
    { name: 'Daphini Fabbri', role: 'volunteer', email: 'daphini@wcd.com' },
    { name: 'Alice Freires', role: 'volunteer', email: 'alice@wcd.com' },
    { name: 'Danielle Lop', role: 'volunteer', email: 'danielle@wcd.com' },
    { name: 'Leandro de Sales', role: 'volunteer', email: 'leandro@wcd.com' }
  ];

  volunteersData.forEach(vol => {
    const ref = doc(collection(db, 'users'));
    batch.set(ref, {
      uid: ref.id,
      name: vol.name,
      email: vol.email,
      role: vol.role
    });
  });

  await batch.commit();
  return true;
};
