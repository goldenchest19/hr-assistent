import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { matchingAPI } from '../utils/api';

// Начальное состояние
const initialState = {
  matchHistory: [],
  recentMatches: [],
  currentMatch: null,
  loading: false,
  error: null
};

// Типы действий
const types = {
  FETCH_HISTORY_REQUEST: 'FETCH_HISTORY_REQUEST',
  FETCH_HISTORY_SUCCESS: 'FETCH_HISTORY_SUCCESS',
  FETCH_HISTORY_FAILURE: 'FETCH_HISTORY_FAILURE',
  FETCH_RECENT_MATCHES_REQUEST: 'FETCH_RECENT_MATCHES_REQUEST',
  FETCH_RECENT_MATCHES_SUCCESS: 'FETCH_RECENT_MATCHES_SUCCESS',
  FETCH_RECENT_MATCHES_FAILURE: 'FETCH_RECENT_MATCHES_FAILURE',
  SET_CURRENT_MATCH: 'SET_CURRENT_MATCH',
  CLEAR_CURRENT_MATCH: 'CLEAR_CURRENT_MATCH',
  PERFORM_MATCH_REQUEST: 'PERFORM_MATCH_REQUEST',
  PERFORM_MATCH_SUCCESS: 'PERFORM_MATCH_SUCCESS',
  PERFORM_MATCH_FAILURE: 'PERFORM_MATCH_FAILURE'
};

// Редюсер для управления состоянием
const matchingReducer = (state, action) => {
  switch (action.type) {
    case types.FETCH_HISTORY_REQUEST:
    case types.FETCH_RECENT_MATCHES_REQUEST:
    case types.PERFORM_MATCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        matchHistory: action.payload
      };
    case types.FETCH_RECENT_MATCHES_SUCCESS:
      return {
        ...state,
        loading: false,
        recentMatches: action.payload
      };
    case types.PERFORM_MATCH_SUCCESS:
      return {
        ...state,
        loading: false,
        currentMatch: action.payload,
        recentMatches: [action.payload, ...state.recentMatches].slice(0, 5)
      };
    case types.SET_CURRENT_MATCH:
      return {
        ...state,
        currentMatch: action.payload
      };
    case types.CLEAR_CURRENT_MATCH:
      return {
        ...state,
        currentMatch: null
      };
    case types.FETCH_HISTORY_FAILURE:
    case types.FETCH_RECENT_MATCHES_FAILURE:
    case types.PERFORM_MATCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Создание контекста
const MatchingContext = createContext();

// Провайдер контекста
export const MatchingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(matchingReducer, initialState);

  // Загрузка последних сопоставлений при инициализации
  useEffect(() => {
    fetchRecentMatches();
  }, []);

  // Функции для работы с API

  // Получение истории сопоставлений
  const fetchMatchHistory = useCallback(async (params) => {
    dispatch({ type: types.FETCH_HISTORY_REQUEST });
    try {
      const response = await matchingAPI.getMatchingHistory(params);
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      dispatch({ 
        type: types.FETCH_HISTORY_SUCCESS, 
        payload: data
      });
    } catch (error) {
      dispatch({ 
        type: types.FETCH_HISTORY_FAILURE, 
        payload: error.message 
      });
    }
  }, []);

  // Получение последних сопоставлений
  const fetchRecentMatches = async () => {
    dispatch({ type: types.FETCH_RECENT_MATCHES_REQUEST });
    try {
      const response = await matchingAPI.getMatchingHistory({ limit: 5 });
      dispatch({ 
        type: types.FETCH_RECENT_MATCHES_SUCCESS, 
        payload: response.data 
      });
    } catch (error) {
      dispatch({ 
        type: types.FETCH_RECENT_MATCHES_FAILURE, 
        payload: error.message 
      });
    }
  };

  // Получение сопоставления по ID
  const fetchMatchById = async (id) => {
    dispatch({ type: types.PERFORM_MATCH_REQUEST });
    try {
      const response = await matchingAPI.getMatchingById(id);
      dispatch({ 
        type: types.PERFORM_MATCH_SUCCESS, 
        payload: response.data 
      });
    } catch (error) {
      dispatch({ 
        type: types.PERFORM_MATCH_FAILURE, 
        payload: error.message 
      });
    }
  };

  // Выполнение сопоставления резюме и вакансии
  const performMatching = async (resumeType, resumeData, vacancyType, vacancyData) => {
    dispatch({ type: types.PERFORM_MATCH_REQUEST });
    try {
      let response;

      // Определение типа запроса на основе параметров
      if (resumeType === 'file') {
        if (vacancyType === 'url') {
          response = await matchingAPI.matchResumeFileToVacancyUrl(resumeData, vacancyData);
        } else {
          response = await matchingAPI.matchResumeFileToVacancyText(resumeData, vacancyData);
        }
      } else if (resumeType === 'url') {
        if (vacancyType === 'url') {
          response = await matchingAPI.matchResumeUrlToVacancyUrl(resumeData, vacancyData);
        } else {
          response = await matchingAPI.matchResumeUrlToVacancyText(resumeData, vacancyData);
        }
      } else {
        if (vacancyType === 'url') {
          response = await matchingAPI.matchResumeTextToVacancyUrl(resumeData, vacancyData);
        } else {
          response = await matchingAPI.matchResumeTextToVacancyText(resumeData, vacancyData);
        }
      }

      dispatch({ 
        type: types.PERFORM_MATCH_SUCCESS, 
        payload: response.data 
      });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: types.PERFORM_MATCH_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };

  // Установка текущего сопоставления
  const setCurrentMatch = (match) => {
    dispatch({ type: types.SET_CURRENT_MATCH, payload: match });
  };

  // Очистка текущего сопоставления
  const clearCurrentMatch = () => {
    dispatch({ type: types.CLEAR_CURRENT_MATCH });
  };

  // Значения и функции, предоставляемые контекстом
  const value = {
    ...state,
    fetchMatchHistory,
    fetchRecentMatches,
    fetchMatchById,
    performMatching,
    setCurrentMatch,
    clearCurrentMatch
  };

  return (
    <MatchingContext.Provider value={value}>
      {children}
    </MatchingContext.Provider>
  );
};

// Хук для использования контекста
export const useMatching = () => {
  const context = useContext(MatchingContext);
  if (!context) {
    throw new Error('useMatching must be used within a MatchingProvider');
  }
  return context;
};

export default MatchingContext; 