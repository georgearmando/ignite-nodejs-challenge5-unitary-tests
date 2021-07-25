import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Show user profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('Should be able to show user profile', async () => {
    const { id } = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const userProfile = await showUserProfileUseCase.execute(id as string);

    expect(userProfile).toBeInstanceOf(User);
    expect(userProfile).toEqual(expect.objectContaining({
      name: 'John Doe',
      email: 'johndoe@example.com',
    }));
  });

  it('Should not be able to show profile of non-existing user', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('non-existing user');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
