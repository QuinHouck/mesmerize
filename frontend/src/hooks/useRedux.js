import { useDispatch, useSelector } from 'react-redux';

// Custom hooks for easier Redux usage
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Package-related hooks
export const usePackages = () => {
  const packages = useAppSelector(state => state.packages);
  const dispatch = useAppDispatch();

  return {
    ...packages,
    dispatch,
  };
};

// User-related hooks
export const useUser = () => {
  const user = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  return {
    ...user,
    dispatch,
  };
};

// Game-related hooks
export const useQuiz = () => {
  const quiz = useAppSelector(state => state.quiz);
  const dispatch = useAppDispatch();

  return {
    ...quiz,
    dispatch,
  };
};

// test-related hooks
export const useTest = () => {
  const test = useAppSelector(state => state.test);
  const dispatch = useAppDispatch();

  return {
    ...test,
    dispatch,
  };
};

// Game-related hooks
export const useNetwork = () => {
  const network = useAppSelector(state => state.network);
  const dispatch = useAppDispatch();

  return {
    ...network,
    dispatch,
  };
};

// Combined hook for common operations
export const useApp = () => {
  const packages = usePackages();
  const user = useUser();
  const quiz = useQuiz();
  const test = useTest();
  const network = useNetwork();

  return {
    packages,
    user,
    quiz,
    test,
    network,
  };
};
