import mongoose from 'mongoose';
import { Tournament, TournamentCreateDto } from '@tournament';
import { bodyGetAll } from '@testing/mocks/body.mock';
import { getAllFromTournaments } from '@testing/helpers/helpers';
import { api } from '@test-helpers/app.helper';
import { tournaments } from '@test-mocks/models.mock';

describe('Tournament', () => {
  beforeEach(async () => {
    await Tournament.deleteMany({}).exec();
    for (const tournament of tournaments) {
      const tournamentObj = new Tournament(tournament);
      await tournamentObj.save();
    }
  });

  describe('Get all tournaments', () => {
    test('tournaments and pagination', async () => {
      await api
        .post('/tournaments/getAll')
        .send(bodyGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });

    test('tournaments and pagination', async () => {
      const { items } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length);
    });

    test('the first tournament status is Todo', async () => {
      const { status } = await getAllFromTournaments();
      expect(status).toContain('Todo');
      expect(status).toContain('InProgress');
    });
  });

  describe('Create tournament', () => {
    test('a valid tournament be added', async () => {
      const newTournament: TournamentCreateDto = {
        name: 'Prueba23',
        maxParticipants: 32,
        requisites: [],
        status: 'Completed',
      };

      await api
        .post('/tournaments/create')
        .send(newTournament)
        .expect(200)
        .expect('Content-type', /application\/json/);

      const { items, status } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length + 1);
      expect(status).toContain(newTournament.status);
    });

    test('a not valid tournament be added', async () => {
      const newTournament: TournamentCreateDto = {
        name: '',
        maxParticipants: 32,
        requisites: [],
        status: 'Completed',
      };

      await api
        .post('/tournaments/create')
        .send(newTournament)
        .expect(400)
        .expect('Content-type', /application\/json/);

      const { items } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length);
    });
  });

  describe('Delete tournament', () => {
    test('a tournament can be deleted', async () => {
      const { items } = await getAllFromTournaments();
      const tournamentToDeleted = items[0];
      await api
        .delete(`/tournaments/one/${tournamentToDeleted._id}`)
        .expect(200);

      const { items: items2 } = await getAllFromTournaments();
      expect(items2).toHaveLength(tournaments.length - 1);
    });

    test('a tournament can not be deleted', async () => {
      await api.delete(`/tournaments/one/123`).expect(400);

      const { items } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length);
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
