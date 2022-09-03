import { TournamentCreateDto } from '@tournament';
import { bodyGetAll } from '@testing/mocks/body.mock';
import { getAllFromTournaments } from '@testing/helpers/helpers';
import { api, setMockTournaments } from '@test-helpers/app.helper';
import { tournaments } from '@test-mocks/models.mock';
import { clearDatabase, closeDatabase } from '../../db';
import supertest from 'supertest';

describe('Tournament', () => {
  let apiTest: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => (apiTest = api));
  beforeEach(async () => await setMockTournaments());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('getAll', () => {
    test('tournaments and pagination', async () => {
      await apiTest
        .post('/tournaments/getAll')
        .send(bodyGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });

    test('check length items', async () => {
      const { items } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length);
    });

    test('the first tournament status is Todo', async () => {
      const { status } = await getAllFromTournaments();
      expect(status).toContain('Todo');
      expect(status).toContain('InProgress');
    });
  });

  describe('getAllOfAllStates', () => {
    test('code === 200', async () => {
      await apiTest.post('/tournaments/getAllOfAllStates').expect(200);
    });
  });

  describe('getDaysForCalendar', () => {
    test('code === 200', async () => {
      await apiTest.post('/tournaments/getDaysForCalendar').expect(200);
    });
  });
  describe('getCalendarItems', () => {
    test('code === 200', async () => {
      await apiTest
        .post('/tournaments/getCalendarItems')
        .send({ date: '2022-09-01' })
        .expect(200);
    });
  });

  describe('getOne', () => {
    test('item valid', async () => {
      const { items } = await getAllFromTournaments();
      await apiTest
        .post('/tournaments/getOne')
        .send({ id: items[0]._id.toString() })
        .expect(200);
    });

    test('item invalid', async () => {
      await apiTest.post('/tournaments/getOne').send({ id: '1' }).expect(400);
    });
  });

  describe('create', () => {
    test('a valid tournament be added', async () => {
      const newTournament: TournamentCreateDto = {
        name: 'Prueba23',
        maxParticipants: 32,
        requisites: [],
        status: 'Completed',
      };

      await apiTest
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

      await apiTest
        .post('/tournaments/create')
        .send(newTournament)
        .expect(400)
        .expect('Content-type', /application\/json/);

      const { items } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length);
    });
  });

  describe('startTournament', () => {
    test('', async () => {
      const { items } = await getAllFromTournaments();
      await apiTest
        .post('/tournaments/startTournament')
        .send({ id: items[0]._id.toString() });
    });
  });

  describe('resetTournament', () => {
    test('', async () => {
      const { items } = await getAllFromTournaments();
      await apiTest
        .post('/tournaments/resetTournament')
        .send({ id: items[0]._id.toString() });
    });
  });

  describe('cancelTournament', () => {
    test('', async () => {
      const { items } = await getAllFromTournaments();
      await apiTest
        .post('/tournaments/cancelTournament')
        .send({ id: items[0]._id.toString() });
    });
  });

  describe('forceNextRound', () => {
    test('failed with not rounds created', async () => {
      const { items } = await getAllFromTournaments();
      const id = items[0]._id.toString();
      await apiTest
        .post(`/tournaments/forceNextRound`)
        .send({
          tournamentId: id,
        })
        .expect(400);
    });
  });

  describe('deleteAllRequisitesOfTournament', () => {
    test('Delete OK', async () => {
      const { items } = await getAllFromTournaments();
      const id = items[0]._id.toString();
      await apiTest
        .delete(`/tournaments/allRequisitesOfTournament/${id}`)
        .expect(200);
    });
  });

  describe('deleteOne', () => {
    test('a tournament can be deleted', async () => {
      const { items } = await getAllFromTournaments();
      const tournamentToDeleted = items[0];
      await apiTest
        .delete(`/tournaments/one/${tournamentToDeleted._id}`)
        .expect(200);

      const { items: items2 } = await getAllFromTournaments();
      expect(items2).toHaveLength(tournaments.length - 1);
    });

    test('a tournament can not be deleted', async () => {
      await apiTest.delete(`/tournaments/one/123`).expect(400);

      const { items } = await getAllFromTournaments();
      expect(items).toHaveLength(tournaments.length);
    });
  });
});
