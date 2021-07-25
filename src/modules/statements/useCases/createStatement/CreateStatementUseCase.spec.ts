import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('Should not be able to create a statement for a non-existing user', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'non-existing',
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: 'Wage'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('Should be able to create a new deposit statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345',
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Wage'
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should be able to create a new withdraw statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345',
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: 'Wage'
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.WITHDRAW,
      amount: 500,
      description: 'Wage'
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create a withdraw statement with insufficient founds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345',
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        amount: 1000,
        description: 'Food'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
