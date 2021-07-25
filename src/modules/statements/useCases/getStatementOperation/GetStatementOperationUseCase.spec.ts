import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Get Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('Should be able to get statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Wage'
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id)
    });

    expect(statementOperation).toBe(statement);
  });

  it('Should not be able to get statement operation for a non-existing user', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Wage'
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'non-existing',
        statement_id: String(statement.id)
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('Should not be able to get statement operation for a non-existing statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: 'non-existing'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
