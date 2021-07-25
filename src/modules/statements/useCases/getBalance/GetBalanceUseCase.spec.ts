import { OperationType } from '../../entities/Statement';
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from './GetBalanceError';

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Get user balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('Should be able to list all user operation and balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'farra'
    });

    const statement2 = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'farra'
    });

    const statement3 = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      type: OperationType.WITHDRAW,
      amount: 500,
      description: 'farra'
    });

    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id)
    });

    expect(balance).toStrictEqual({
      statement: expect.arrayContaining([statement, statement2, statement3]),
      balance: 1500,
    });
  });

  it('Should not be able to list transactions and balance of a non-existing user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non-existing'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
