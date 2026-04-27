import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  isActive: boolean;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

type UserWithoutPassword = Omit<AuthUser, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, phone } = registerDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    let clientRole = await this.prisma.role.findUnique({
      where: { name: 'CLIENTE' },
    });

    if (!clientRole) {
      clientRole = await this.prisma.role.create({
        data: { name: 'CLIENTE' },
      });
    }

    const hashedPassword: string = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        roleId: clientRole.id,
      },
      include: { role: true },
    });

    const userWithoutPassword = this.removePassword(user);

    return {
      message: 'Usuario registrado correctamente',
      user: userWithoutPassword,
      token: this.generateToken(user.id, user.email, user.role.name),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid: boolean = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const userWithoutPassword = this.removePassword(user);

    return {
      message: 'Login correcto',
      user: userWithoutPassword,
      token: this.generateToken(user.id, user.email, user.role.name),
    };
  }

  private removePassword(user: AuthUser): UserWithoutPassword {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    };
  }

  private generateToken(id: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: id,
      email,
      role,
    });
  }
}
