import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeContainer,
  Section,
  Icon,
  IconGroup,
  LogoContainer,
  Logo,
  Footer,
  Title,
  ContentGrid
} from './HomeStyles';
import logo from '../../assets/LOGO_TCS.png';
import LogoutButton from '../Auth/Logout/LogoutButton';
import UsuarioMenu from '../UsuarioMenu/UsuarioMenu';

const Home = () => {
  return (
    
    <>

      <HomeContainer>
          <UsuarioMenu />
        <LogoContainer>
          <Logo src={logo} alt="Logo" />
          
        </LogoContainer>
  
   
        <Title>SOPORTE EN SITIO</Title>

        <ContentGrid>
          <Link to="/formularioEquipos" style={{ textDecoration: 'none' }}>
            <Section color="#023047">
              <h2>Formulario Informes Técnicos Laptops / PCs</h2>
              <IconGroup>
                <Icon>🖥️</Icon>
                <Icon>💻</Icon>
              </IconGroup>
            </Section>
          </Link>

          <Link to="/formularioComponentes" style={{ textDecoration: 'none' }}>
            <Section color="#fb8500">
              <h2>Formulario Informes Técnicos Componentes</h2>
              <IconGroup>
                <Icon>🖱️</Icon>
                <Icon>🖨️</Icon>
                <Icon>⌨️</Icon>
              </IconGroup>
            </Section>
          </Link>

          <Link to="/historial-informes" style={{ textDecoration: 'none' }}>
            <Section color="#219ebc">
              <h2>Historial de Informes Técnicos</h2>
              <IconGroup>
                <Icon>📄</Icon>
                <Icon>🗂️</Icon>
              </IconGroup>
            </Section>
          </Link>
        </ContentGrid>
      </HomeContainer>

      <Footer>
        Desarrollado por Alexis Aldás © 2025 - Tata Consultancy Services
      </Footer>
    </>
  );
};

export default Home;
