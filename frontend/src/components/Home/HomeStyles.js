import styled from 'styled-components';

/* export const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-top: 100px;
  margin-bottom: 20px;
  width: 100%;
`;
 */
  export const Title = styled.h2`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #2c3e50;
    background: linear-gradient(to right, #aeafb9ff, #0e1136ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    gap: 0.5rem;
  `;

export const LogoContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
`;

export const Logo = styled.img`
  width: 180px;
  height: auto;
`;


export const Footer = styled.footer`
  background-color: #050505ff;
  color: #FFFF;
  text-align: center;
  padding: 5px 0;
  width: 100%;
  font-size: 14px;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
`;

export const ContentGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  width: 100%;
 /*  max-width: 1200px; */
  margin-top: 2rem;
`;

export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background-color: #f4f4f4;
  gap: 2rem;
  padding: 2rem;
  box-sizing: border-box;
`;


export const Section = styled.div`
  background-color: ${({ color }) => color || '#fff'};
  color: white;
  padding: 30px;
  margin: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  text-align: center;
  width: 300px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;


export const IconGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

export const Icon = styled.div`
  font-size: 3rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

export const ButtonComponentes = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: white;
  color: ${({ color }) => color || '#28a745'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #e6ffe6;
    transform: scale(1.05);
  }
`;

/* @keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
} */