import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  Alert,
  TextInput,
  Switch,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PetCareScreen from './PetCareScreen';


export default function App() {
  const PERSIST_KEYS = {
    currentPetId: 'PERSIST_CURRENT_PET_ID',
    petStatuses: 'PERSIST_PET_STATUSES',
    settings: 'PERSIST_APP_SETTINGS',
    diaryEntries: 'PERSIST_DIARY_ENTRIES',
    lastClaimDate: 'PERSIST_LAST_CLAIM_DATE',
    iceCoins: 'PERSIST_ICE_COINS',
    savedMoney: 'PERSIST_SAVED_MONEY',
    dreamPlans: 'PERSIST_DREAM_PLANS',
    selectedDreamPlanId: 'PERSIST_SELECTED_DREAM_PLAN_ID',
    transactions: 'PERSIST_TRANSACTIONS',
    dailyCheckStatus: 'PERSIST_DAILY_CHECK_STATUS',
  };

  const [selectedPet, setSelectedPet] = useState(null);
  const [petStatuses, setPetStatuses] = useState({});
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  // 不再需要 imagesLoaded 狀態，直接顯示圖片
  // const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPetCare, setShowPetCare] = useState(false);
  const [showMyPets, setShowMyPets] = useState(false);
  const [openAccountingFlag, setOpenAccountingFlag] = useState(false);
  const [openSavingsFlag, setOpenSavingsFlag] = useState(false);
  const [showSavingsPage, setShowSavingsPage] = useState(false);
  
  // 每日登入獎勵狀態
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  
  // 日記本狀態
  const [showDiary, setShowDiary] = useState(false);
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [showDiaryEntry, setShowDiaryEntry] = useState(false);
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState(null);
  const [showDiaryHistory, setShowDiaryHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState({
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: false,
    reminderEnabled: false,
    reminderHour: 20,
    reminderMinute: 0,
    reminderConfirmed: false,
    theme: 'light',
    language: 'zh-TW', // 固定為繁體中文

  });
  // 簡易多語系
  const i18n = {
    'zh-TW': {
      appTitle: 'Pet Q',
      subtitle: '與你的毛小孩一起成長',
      panelTitle: '功能面板',
      menu_myPets: '毛小孩們',
      menu_gift: '禮物箱',
      menu_diary: '日記本',
      menu_settings: '設定',
      myPetsTitle: '🐾 毛小孩們',
      goToNurture: '前往養成',
      noPetSelected: '尚未選擇寵物',
      switchPartner: '切換夥伴',
      noNurturedPets: '尚無養成紀錄，選擇寵物開始養成吧！',
      dailyRewardTitle: '🎁 每日登入獎勵',
      dailyRewardDesc: '每日登入即可領取冰冰幣獎勵！',
      dailyRewardNoteClaimed: '今日已領取',
      dailyRewardNoteUnclaimed: '今日尚未領取',
      claimNow: '立即領取',
      claimed: '已領取',
      diaryTitle: '📝 今日日記',
      handwritingDiary: '✍️ 手寫日記',
      saveDiary: '保存日記',
      diaryHistory: '🗂 歷史紀錄',
      diaryNone: '尚無日記紀錄',
      viewDiary: '查看',
      delete: '刪除',
      diaryContentTitle: '📖 日記內容',
      diarySaveEmpty: '請先輸入日記內容',
      petQuotesTitle: '🐾 寵物語錄',
      todayStatsTitle: '📊 今日互動統計',
      stat_feed: '餵食次數',
      stat_clean: '清潔次數',
      stat_pet: '摸摸頭',
      stat_walk: '散步次數',
      stat_affection: '親密度提升',
      settingsTitle: '⚙️ 設定',
      appearance: '外觀',
      firstTimeTitle: '歡迎來到 Pet Q！',
      firstTimeMessage: '請選擇一隻寵物作為你的起始夥伴',
      welcomeTitle: '歡迎加入！',
      welcomeMessage: '你選擇了我，我會陪你一起記帳和存錢！',
      gotIt: '我知道了',
      selectPet: '選擇這隻寵物',
      accounting: '記帳',
      savings: '存錢',

      theme_light: '淺色', theme_dark: '深色', theme_system: '跟隨系統',
    },
    en: {
      appTitle: 'Pet Q',
      subtitle: 'Grow with your pet companions',
      panelTitle: 'Features',
      menu_myPets: 'My Pets',
      menu_gift: 'Gifts',
      menu_diary: 'Diary',
      menu_settings: 'Settings',
      myPetsTitle: '🐾 My Pets',
      goToNurture: 'Go to Nurturing',
      noPetSelected: 'No pet selected',
      switchPartner: 'Switch Partner',
      noNurturedPets: 'No nurturing records yet. Pick a pet to start!',
      dailyRewardTitle: '🎁 Daily Login Reward',
      dailyRewardDesc: 'Log in daily to get Ice Coins!',
      dailyRewardNoteClaimed: 'Claimed today',
      dailyRewardNoteUnclaimed: 'Not claimed today',
      claimNow: 'Claim Now',
      claimed: 'Claimed',
      diaryTitle: '📝 Today\'s Diary',
      handwritingDiary: '✍️ Handwritten Diary',
      saveDiary: 'Save Diary',
      diaryHistory: '🗂 History',
      diaryNone: 'No diary entries yet',
      viewDiary: 'View',
      delete: 'Delete',
      diaryContentTitle: '📖 Diary Entry',
      diarySaveEmpty: 'Please write something first',
      petQuotesTitle: '🐾 Pet Quotes',
      todayStatsTitle: '📊 Today\'s Interactions',
      stat_feed: 'Feeds',
      stat_clean: 'Cleans',
      stat_pet: 'Head Pats',
      stat_walk: 'Walks',
      stat_affection: 'Affection Gained',
      settingsTitle: '⚙️ Settings',
      appearance: 'Appearance',
      firstTimeTitle: 'Welcome to Pet Q!',
      firstTimeMessage: 'Please choose a pet as your starting companion',
      welcomeTitle: 'Welcome!',
      welcomeMessage: 'You chose me! I will accompany you in budgeting and saving money!',
      gotIt: 'Got it',
      selectPet: 'Choose this pet',
      accounting: 'Accounting',
      savings: 'Savings',

      theme_light: 'Light', theme_dark: 'Dark', theme_system: 'System',
    },
  };
  const t = (key) => (i18n[settings.language] && i18n[settings.language][key]) || (i18n['zh-TW'][key] || key);
  const formatDiaryTimestamp = (isoText) => {
    try {
      const d = new Date(isoText);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${y}/${m}/${day} ${hh}:${mm}`;
    } catch (e) {
      return isoText || '';
    }
  };



  const TimestampChip = ({ iso }) => (
    <View style={{
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? '#0F172A' : '#DBEAFE',
      borderWidth: 2,
      borderColor: theme.isDark ? '#1E40AF' : '#93C5FD',
      borderRadius: 18,
      paddingVertical: 6,
      paddingHorizontal: 12,
      shadowColor: theme.isDark ? '#000' : '#3B82F6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <Text style={{ color: theme.isDark ? '#93C5FD' : '#1E40AF', fontWeight: '700', fontSize: 11 }}>
        {formatDiaryTimestamp(iso)}
      </Text>
    </View>
  );



  // 主題（深色/淺色/系統）
  const systemColorScheme = useColorScheme && useColorScheme();
  const isDarkTheme = settings.theme === 'dark' ? true : settings.theme === 'light' ? false : (systemColorScheme === 'dark');
  const theme = {
    isDark: isDarkTheme,
    colors: isDarkTheme
      ? {
          background: '#121212',
          card: '#1E1E1E',
          panel: '#0F172A',
          text: '#EDEFF2',
          subText: '#B0BEC5',
          border: '#263238',
          inputBg: '#2A2A2A',
          placeholder: '#78909C',
        }
      : {
          background: '#FFFFFF',
          card: '#FFFFFF',
          panel: '#F0F8FF',
          text: '#333333',
          subText: '#666666',
          border: '#E3F2FD',
          inputBg: '#FFFFFF',
          placeholder: '#999999',
        },
  };
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [todayStats, setTodayStats] = useState({
    feedCount: 0,
    cleanCount: 0,
    petCount: 0,
    walkCount: 0,
    affectionGained: 0
  });
  const [petsWithRecords, setPetsWithRecords] = useState(new Set());
  const [scheduledReminderId, setScheduledReminderId] = useState(null);




  // 寵物語錄觸發狀態
  const [petQuoteTriggered, setPetQuoteTriggered] = useState(false);

  // 移除圖片載入延遲，讓圖片立即顯示

  // 寵物角色資料
  const pets = [
    {
      id: 1,
      name: 'T系寵物',
      image: require('./B/T.png'),
    },
    {
      id: 2,
      name: 'R系寵物',
      image: require('./B/R.png'),
    },
    {
      id: 3,
      name: 'P系寵物',
      image: require('./B/P.png'),
    },
    {
      id: 4,
      name: 'D系寵物',
      image: require('./B/D.png'),
    },
    {
      id: 5,
      name: 'C系寵物',
      image: require('./B/C.png'),
    },
  ];

  // 檢查寵物是否有遊玩紀錄的函數
  const checkPetRecords = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const petRecordKeys = keys.filter(k => 
        k.startsWith('PERSIST_PET_STATUS') || 
        k.startsWith('PERSIST_TRANSACTIONS') || 
        k.startsWith('PERSIST_DAILY_COUNTERS') ||
        k.startsWith('PERSIST_SAVED_MONEY') ||
        k.startsWith('PERSIST_BACKPACK')
      );
      
      // 如果有任何寵物相關的紀錄，檢查實際資料
      if (petRecordKeys.length > 0) {
        const petStatusData = await AsyncStorage.getItem('PERSIST_PET_STATUS');
        const transactionsData = await AsyncStorage.getItem('PERSIST_TRANSACTIONS');
        const dailyCountersData = await AsyncStorage.getItem('PERSIST_DAILY_COUNTERS');
        const savedMoneyData = await AsyncStorage.getItem('PERSIST_SAVED_MONEY');
        
        // 檢查是否有實際的遊玩數據（不只是初始值）
        let hasActualData = false;
        
        if (petStatusData) {
          try {
            const status = JSON.parse(petStatusData);
            // 如果寵物狀態不是初始值（30,30,30），就算有遊玩紀錄
            if (status.hunger !== 30 || status.cleanliness !== 30 || status.affection !== 30) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        if (transactionsData) {
          try {
            const transactions = JSON.parse(transactionsData);
            // 如果有任何交易紀錄，就算有遊玩紀錄
            if (Array.isArray(transactions) && transactions.length > 0) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        if (dailyCountersData) {
          try {
            const counters = JSON.parse(dailyCountersData);
            // 如果有任何計數器被使用過，就算有遊玩紀錄
            if (counters.feed > 0 || counters.clean > 0 || counters.pet > 0 || counters.walk > 0) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        if (savedMoneyData) {
          try {
            const savedMoney = JSON.parse(savedMoneyData);
            // 如果有存錢紀錄，就算有遊玩紀錄
            if (savedMoney > 0) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        // 如果有實際遊玩數據，就將當前寵物標記為有紀錄
        if (hasActualData) {
          const currentPetId = await AsyncStorage.getItem(PERSIST_KEYS.currentPetId);
          if (currentPetId) {
            setPetsWithRecords(prev => new Set([...prev, parseInt(currentPetId, 10)]));
          }
        }
      }
    } catch (e) {
      console.warn('check pet records error', e);
    }
  };

  // 啟動時還原已選擇的寵物與設定
  useEffect(() => {
    (async () => {
      try {

        // 載入已選寵物
        const idText = await AsyncStorage.getItem(PERSIST_KEYS.currentPetId);
        const idNum = idText ? parseInt(idText, 10) : null;
        
        if (idNum) {
          // 已有寵物，非第一次使用者
          const found = pets.find(p => p.id === idNum);
          if (found) setSelectedPet(found);
          setIsFirstTimeUser(false);
        } else {
          // 第一次使用者，需要選擇起始寵物
          setIsFirstTimeUser(true);
          setShowPetSelection(true);
        }

        // 載入寵物活躍狀態，且確保同時間只有一隻 active
        const statusesText = await AsyncStorage.getItem(PERSIST_KEYS.petStatuses);
        const loadedStatuses = statusesText ? JSON.parse(statusesText) : {};
        const nextStatuses = {};
        pets.forEach(p => { nextStatuses[p.id] = loadedStatuses[p.id] || 'idle'; });
        if (idNum) {
          Object.keys(nextStatuses).forEach(id => { if (parseInt(id, 10) !== idNum && nextStatuses[id] === 'active') nextStatuses[id] = 'idle'; });
          nextStatuses[idNum] = 'active';
        }
        setPetStatuses(nextStatuses);
        
        // 載入設定
        const settingsJson = await AsyncStorage.getItem(PERSIST_KEYS.settings);
        if (settingsJson) {
          const parsedSettings = JSON.parse(settingsJson);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }

        // 檢查寵物遊玩紀錄
        await checkPetRecords();

        // 載入日記歷史
        const diaryJson = await AsyncStorage.getItem(PERSIST_KEYS.diaryEntries);
        if (diaryJson) {
          try {
            const parsed = JSON.parse(diaryJson);
            if (Array.isArray(parsed)) setDiaryEntries(parsed);
          } catch (e) {}
        }

        // 載入最後領取日期
        const lastClaimText = await AsyncStorage.getItem(PERSIST_KEYS.lastClaimDate);
        if (lastClaimText) {
          setLastClaimDate(lastClaimText);
        }

        // 載入冰冰幣
        const iceCoinsText = await AsyncStorage.getItem(PERSIST_KEYS.iceCoins);
        if (iceCoinsText) {
          setIceCoins(parseInt(iceCoinsText, 10) || 0);
        }

        // 載入存錢數據
        const savedMoneyText = await AsyncStorage.getItem(PERSIST_KEYS.savedMoney);
        if (savedMoneyText) {
          setSavedMoney(parseInt(savedMoneyText, 10) || 0);
        }

        // 載入夢想計畫
        const dreamPlansText = await AsyncStorage.getItem(PERSIST_KEYS.dreamPlans);
        if (dreamPlansText) {
          try {
            const parsed = JSON.parse(dreamPlansText);
            if (Array.isArray(parsed)) setDreamPlans(parsed);
          } catch (e) {}
        }

        // 載入選中的夢想計畫ID
        const selectedPlanText = await AsyncStorage.getItem(PERSIST_KEYS.selectedDreamPlanId);
        if (selectedPlanText) {
          setSelectedDreamPlanId(parseInt(selectedPlanText, 10) || null);
        }

        // 載入交易數據
        const transactionsText = await AsyncStorage.getItem(PERSIST_KEYS.transactions);
        if (transactionsText) {
          try {
            const parsed = JSON.parse(transactionsText);
            if (Array.isArray(parsed)) setTransactions(parsed);
          } catch (e) {}
        }
        
        // 載入打卡狀態
        const checkStatusText = await AsyncStorage.getItem(PERSIST_KEYS.dailyCheckStatus);
        if (checkStatusText) {
          try {
            const parsed = JSON.parse(checkStatusText);
            setDailyCheckStatus(parsed);
          } catch (e) {}
        }

        // 標記資料載入完成
        setDataLoaded(true);
      } catch (e) {
        console.warn('load data error', e);
        // 即使載入失敗，也要標記為完成，避免永遠不保存
        setDataLoaded(true);
      }
    })();
  }, []);

  // 保存寵物活躍狀態
  useEffect(() => {
    (async () => {
      try {
        if (petStatuses && Object.keys(petStatuses).length > 0) {
          await AsyncStorage.setItem(PERSIST_KEYS.petStatuses, JSON.stringify(petStatuses));
        }
      } catch (e) {
        console.warn('save pet statuses error', e);
      }
    })();
  }, [petStatuses]);

  // 設定變更時自動儲存
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.settings, JSON.stringify(settings));
      } catch (e) {
        console.warn('save settings error', e);
      }
    })();
  }, [settings]);

  // 用於追蹤資料是否已載入完成
  const [dataLoaded, setDataLoaded] = useState(false);

  // 日記歷史變更時自動儲存（只有在資料載入完成後才保存）
  useEffect(() => {
    if (!dataLoaded) return; // 資料尚未載入完成，不要保存
    
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.diaryEntries, JSON.stringify(diaryEntries));
      } catch (e) {
        console.warn('save diary entries error', e);
      }
    })();
  }, [diaryEntries, dataLoaded]);

  // 最後領取日期變更時自動儲存
  useEffect(() => {
    if (lastClaimDate) {
      (async () => {
        try {
          await AsyncStorage.setItem(PERSIST_KEYS.lastClaimDate, lastClaimDate);
        } catch (e) {
          console.warn('save last claim date error', e);
        }
      })();
    }
  }, [lastClaimDate]);

  // 冰冰幣變更時自動儲存
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.iceCoins, iceCoins.toString());
      } catch (e) {
        console.warn('save ice coins error', e);
      }
    })();
  }, [iceCoins]);

  // 存錢數據變更時自動儲存
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.savedMoney, savedMoney.toString());
      } catch (e) {
        console.warn('save savedMoney error', e);
      }
    })();
  }, [savedMoney]);

  // 夢想計畫變更時自動儲存
  useEffect(() => {
    if (!dataLoaded) return;
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.dreamPlans, JSON.stringify(dreamPlans));
      } catch (e) {
        console.warn('save dreamPlans error', e);
      }
    })();
  }, [dreamPlans, dataLoaded]);

  // 當夢想計畫載入後，如果沒有選中計畫且有可用計畫，自動選擇第一個
  useEffect(() => {
    if (dreamPlans.length > 0 && !selectedDreamPlanId) {
      setSelectedDreamPlanId(dreamPlans[0].id);
    }
  }, [dreamPlans, selectedDreamPlanId]);

  // 選中的夢想計畫ID變更時自動儲存
  useEffect(() => {
    if (selectedDreamPlanId !== null) {
      (async () => {
        try {
          await AsyncStorage.setItem(PERSIST_KEYS.selectedDreamPlanId, selectedDreamPlanId.toString());
        } catch (e) {
          console.warn('save selectedDreamPlanId error', e);
        }
      })();
    }
  }, [selectedDreamPlanId]);

  // 交易數據變更時自動儲存
  useEffect(() => {
    if (!dataLoaded) return;
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.transactions, JSON.stringify(transactions));
      } catch (e) {
        console.warn('save transactions error', e);
      }
    })();
  }, [transactions, dataLoaded]);
  
  // 冰冰幣變更時自動儲存
  useEffect(() => {
    if (!dataLoaded) return;
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.iceCoins, iceCoins.toString());
      } catch (e) {
        console.warn('save iceCoins error', e);
      }
    })();
  }, [iceCoins, dataLoaded]);
  
  // 打卡狀態變更時自動儲存
  useEffect(() => {
    if (!dataLoaded) return;
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.dailyCheckStatus, JSON.stringify(dailyCheckStatus));
      } catch (e) {
        console.warn('save dailyCheckStatus error', e);
      }
    })();
  }, [dailyCheckStatus, dataLoaded]);
  
  // 監聽交易和日記變更，更新打卡狀態
  useEffect(() => {
    if (dataLoaded) {
      checkAndResetDailyStatus();
    }
  }, [transactions, diaryEntries, dataLoaded]);

  // 根據提醒設定排程/取消每日提醒（若裝置已支援通知）
  // 提醒功能已移除

  // 首頁按鈕
  const menuButtons = [
    { id: 1, key: 'myPets', icon: '🐾', color: '#FF6B6B' },
    { id: 2, key: 'accounting', icon: '📊', color: '#87CEEB' },
    { id: 3, key: 'savings', icon: '💰', color: '#98FB98' },
    { id: 4, key: 'gift', icon: '🎁', color: '#96CEB4' },
    { id: 5, key: 'diary', icon: '📝', color: '#FFEAA7' },
    { id: 8, key: 'settings', icon: '⚙️', color: '#F7DC6F' },
  ];

  const handlePetSelect = (pet) => {
    // 確保同時間只有一隻 active
    setPetStatuses(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (parseInt(id, 10) !== pet.id && next[id] === 'active') {
          next[id] = 'idle';
        }
      });
      next[pet.id] = 'active';
      return next;
    });

    setSelectedPet(pet);
    setShowPetCare(true); // 直接進入養成頁面
    AsyncStorage.setItem(PERSIST_KEYS.currentPetId, String(pet.id)).catch(() => {});
    // 選擇寵物後，將其標記為有遊玩紀錄（如果用戶開始養成的話）
    setPetsWithRecords(prev => new Set([...prev, pet.id]));
  };

  // 在毛小孩們功能中的寵物切換邏輯
  const handlePetSwitch = (pet) => {
    const currentStatus = petStatuses[pet.id] || 'idle';
    
    if (currentStatus === 'active') {
      // 如果已經是活躍狀態，進入養成頁面
      setShowMyPets(false);
      setShowPetCare(true);
    } else {
      // 如果不是活躍狀態，只切換為活躍，不進入養成頁面
      setPetStatuses(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (parseInt(id, 10) !== pet.id && next[id] === 'active') {
            next[id] = 'idle';
          }
        });
        next[pet.id] = 'active';
        return next;
      });

      setSelectedPet(pet);
      AsyncStorage.setItem(PERSIST_KEYS.currentPetId, String(pet.id)).catch(() => {});
      setPetsWithRecords(prev => new Set([...prev, pet.id]));
      
      // 顯示提示訊息
      Alert.alert(
        '切換成功',
        `${pet.name} 現在是您的活躍寵物！\n點擊「前往養成」按鈕開始互動。`,
        [{ text: '確定', style: 'default' }]
      );
    }
  };

  // 第一次使用者選擇起始寵物
  const handleFirstTimePetSelect = (pet) => {
    // 設置寵物狀態：選中的為 active，其他為 idle
    const newStatuses = {};
    pets.forEach(p => {
      newStatuses[p.id] = p.id === pet.id ? 'active' : 'idle';
    });
    setPetStatuses(newStatuses);
    
    setSelectedPet(pet);
    setIsFirstTimeUser(false);
    setShowPetSelection(false);
    AsyncStorage.setItem(PERSIST_KEYS.currentPetId, String(pet.id)).catch(() => {});
    
    // 顯示歡迎對話框
    setShowWelcomeDialog(true);
    
    // 選擇寵物後，將其標記為有遊玩紀錄
    setPetsWithRecords(prev => new Set([...prev, pet.id]));
  };



  // 檢查每日登入獎勵
  const checkDailyReward = () => {
    const today = new Date().toDateString();
    const lastClaim = lastClaimDate ? new Date(lastClaimDate).toDateString() : null;
    
    if (lastClaim !== today) {
      setDailyRewardClaimed(false);
    } else {
      setDailyRewardClaimed(true);
    }
  };

  // 冰冰幣狀態（從 PetCareScreen 提升到 App 層級）
  const [iceCoins, setIceCoins] = useState(0);
  
  // 存錢相關狀態
  const [savedMoney, setSavedMoney] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [dreamPlans, setDreamPlans] = useState([]);
  const [selectedDreamPlanId, setSelectedDreamPlanId] = useState(null);
  
  // 記帳相關狀態
  const [showAccountingPage, setShowAccountingPage] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [amountInput, setAmountInput] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [transactionCategory, setTransactionCategory] = useState('餐飲');
  const [transactionNote, setTransactionNote] = useState('');
  
  // 打卡狀態管理
  const [dailyCheckStatus, setDailyCheckStatus] = useState({
    accounting: false,
    diary: false,
    lastResetDate: new Date().toDateString(),
  });
  
  // 檢查並重置每日打卡狀態
  const checkAndResetDailyStatus = () => {
    const today = new Date().toDateString();
    const todayAccountingTransactions = transactions.filter(tx => 
      new Date(tx.date).toDateString() === today
    );
    const todayDiaryEntries = diaryEntries.filter(entry => 
      new Date(entry.createdAt).toDateString() === today
    );
    
    // 調試信息
    console.log('=== 打卡狀態檢查 ===');
    console.log('今天日期:', today);
    console.log('今日記帳筆數:', todayAccountingTransactions.length);
    console.log('今日日記筆數:', todayDiaryEntries.length);
    console.log('所有日記條目:', diaryEntries.map(entry => ({
      id: entry.id,
      createdAt: entry.createdAt,
      dateString: new Date(entry.createdAt).toDateString()
    })));
    
    setDailyCheckStatus(prev => {
      const newStatus = {
        accounting: todayAccountingTransactions.length > 0,
        diary: todayDiaryEntries.length > 0,
        lastResetDate: today,
      };
      
      console.log('新的打卡狀態:', newStatus);
      
      if (prev.lastResetDate !== today) {
        // 新的一天，重置狀態
        return newStatus;
      } else {
        // 同一天，更新狀態
        return {
          ...prev,
          accounting: todayAccountingTransactions.length > 0,
          diary: todayDiaryEntries.length > 0,
        };
      }
    });
  };
  
  // 記帳類別數據（與PetCareScreen保持一致）
  const accountingCategories = [
    { id: '餐飲', icon: '🍱', desc: '餐廳、飲料、食材', color: '#FFB5BA', type: 'expense' },
    { id: '交通', icon: '🚌', desc: '公車、捷運、計程車', color: '#AEC6CF', type: 'expense' },
    { id: '日用品', icon: '🧺', desc: '生活用品、清潔、雜貨', color: '#B4CFB0', type: 'expense' },
    { id: '購物', icon: '🛍️', desc: '衣服、配件、電子產品', color: '#FF80AB', type: 'expense' },
    { id: '房貸', icon: '🏦', desc: '房貸、租金、管理費', color: '#64B5F6', type: 'expense' },
    { id: '娛樂', icon: '🎪', desc: '電影、遊戲、休閒', color: '#FFB347', type: 'expense' },
    { id: '醫療', icon: '🏥', desc: '門診、藥品、保健', color: '#98C1D9', type: 'expense' },
    { id: '寵物', icon: '🐰', desc: '飼料、玩具、美容', color: '#DDA0DD', type: 'expense' },
    { id: '學習', icon: '📚', desc: '課程、書籍、文具', color: '#4DB6AC', type: 'expense' },
    { id: '旅行', icon: '✈️', desc: '機票、住宿、行程', color: '#FFB74D', type: 'expense' },
    { id: '其他支出', icon: '📝', desc: '其他支出項目', color: '#F0E68C', type: 'expense' },
    { id: '工資', icon: '💰', desc: '月薪、時薪、加班費', color: '#90CAF9', type: 'income' },
    { id: '獎金', icon: '✨', desc: '年終、績效、各項獎金', color: '#FFD700', type: 'income' },
    { id: '投資', icon: '📈', desc: '股票、基金、定存利息', color: '#81C784', type: 'income' },
    { id: '中獎', icon: '🎰', desc: '彩券、抽獎、禮品', color: '#FF8A65', type: 'income' },
    { id: '其他收入', icon: '💎', desc: '其他收入來源', color: '#78909C', type: 'income' },
  ];

  // 領取每日登入獎勵
  const claimDailyReward = () => {
    const today = new Date().toDateString();
    setLastClaimDate(today);
    setDailyRewardClaimed(true);
    setShowDailyReward(false);
    
    // 實際增加 20 冰冰幣
    setIceCoins(prev => prev + 20);
    
    Alert.alert(
      '🎉 領取成功！',
      '恭喜獲得 20 冰冰幣！\n記得明天再來領取喔！',
      [{ text: '確定', style: 'default' }]
    );
  };

  // 處理禮物箱按鈕點擊
  const handleGiftBox = () => {
    const today = new Date().toDateString();
    const lastClaim = lastClaimDate ? new Date(lastClaimDate).toDateString() : null;
    
    if (lastClaim === today) {
      // 今日已領取，顯示提示訊息
      Alert.alert(
        '🎁 今日已領取',
        '您今天已經領取過每日獎勵了！\n明天再來領取新的獎勵吧～',
        [{ text: '確定', style: 'default' }]
      );
    } else {
      // 尚未領取，顯示禮物箱
    checkDailyReward();
    setShowDailyReward(true);
    }
  };

  // 處理日記本按鈕點擊
  const handleDiary = () => {
    setShowDiary(true);
  };

  // 保存日記內容
  const saveDiary = (content) => {
    const text = (content || '').trim();
    if (!text) {
      Alert.alert('提示', t('diarySaveEmpty'));
      return;
    }
    const entry = { id: Date.now(), content: text, createdAt: new Date().toISOString() };
    setDiaryEntries(prev => [entry, ...prev]);
    setDiaryContent('');
    setShowDiary(false);
    
    // 立即觸發打卡狀態檢查
    setTimeout(() => {
      checkAndResetDailyStatus();
    }, 100);
  };

  // 記帳功能處理函數
  const handleAddTransaction = () => {
    const amount = parseInt(amountInput, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('❌ 記帳失敗', '請輸入有效的金額！');
      return;
    }
    if (amount > 99999999) {
      Alert.alert('❌ 記帳失敗', '金額最多 8 位數（上限 99,999,999）');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type: transactionType,
      category: transactionCategory,
      amount: amount,
      note: transactionNote.trim(),
      date: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // 記帳冰冰幣獎勵機制（與PetCareScreen保持一致）
    setIceCoins(prev => prev + 2);
    
    // 重置輸入
    setAmountInput('');
    setTransactionNote('');
    
    Alert.alert('💰 記帳成功！', `已記錄 ${transactionType === 'expense' ? '支出' : '收入'} ${amount} 元\n🎉 獲得 2 冰冰幣獎勵！`, [{ text: '確定', style: 'default' }]);
  };

  // 存錢功能處理函數
  const handleSaveMoney = (amount) => {
    if (amount <= 0) {
      Alert.alert('❌ 存錢失敗', '請輸入大於 0 的金額！');
      return;
    }
    if (amount > 99999999) {
      Alert.alert('❌ 存錢失敗', '存入金額最多 8 位數（上限 99,999,999）');
      return;
    }
    
    // 必須選擇夢想計畫
    if (!selectedDreamPlanId) {
      Alert.alert('❌ 存錢失敗', '請先選擇一個夢想計畫！');
      return;
    }
    
    // 更新計畫進度
    setDreamPlans(prev => prev.map(plan => {
      if (plan.id === selectedDreamPlanId) {
        const nextCurrent = (plan.current || 0) + amount;
        return { ...plan, current: nextCurrent };
      }
      return plan;
    }));
    
    const selectedPlan = dreamPlans.find(p => p.id === selectedDreamPlanId);
    const planTitle = selectedPlan ? selectedPlan.title : '';
    setSavedMoney(prev => prev + amount);
    setDepositAmount('');
    Alert.alert('💰 存錢成功！', `已存入 ${amount} 元至「${planTitle}」`, [{ text: '確定', style: 'default' }]);
  };

  // 生成今日寵物語錄
  const generatePetQuote = () => {
    // 檢查是否所有互動次數都超過10次
    const isEligibleForQuote = 
      todayStats.feedCount > 10 && 
      todayStats.cleanCount > 10 && 
      todayStats.petCount > 10 && 
      todayStats.walkCount > 10;
    
    // 如果已經觸發過語錄，顯示感謝訊息
    if (petQuoteTriggered) {
      return "今天的心裡話已經告訴你了～明天再來聽我的新想法吧！";
    }
    
    // 如果條件未達成，顯示提示
    if (!isEligibleForQuote) {
      return "繼續和我互動吧～達到各項互動10次以上就能看到我的心裡話喔！";
    }
    
    // 達到條件且未觸發過，觸發語錄並設定已觸發狀態
    setPetQuoteTriggered(true);
    
    const quotes = [
      "最喜歡主人陪我玩耍的時光",
      "謝謝主人給我滿滿的愛",
      "你在我眼裡，不是主人，是家",
      "我想一直黏在你身邊",
      "主人～我不懂你的煩惱，只會跟你說：只要你需要，我都在",
      "最舒服的地方，不是我的窩，而是有你在的地方"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const renderHomeScreen = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF', borderBottomColor: theme.colors.border }]}>
        <Text style={styles.appTitle}>{t('appTitle')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subText }]}>{t('subtitle')}</Text>
      </View>

      <ScrollView style={styles.homeContent} showsVerticalScrollIndicator={false}>
        
        {/* 上方：活躍寵物展示 */}
        {selectedPet && !isFirstTimeUser && (
          <View style={styles.activePetSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>我的寵物夥伴</Text>
            <TouchableOpacity
              style={[styles.currentPetCard, styles.activePetCard]}
              onPress={() => setShowPetCare(true)}
            >
              <Image 
                source={selectedPet.image} 
                style={styles.currentPetImage}
                resizeMode="contain"
              />
              <View style={styles.currentPetInfo}>
                <Text style={[styles.currentPetName, { color: theme.colors.text }]}>{selectedPet.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: '#4CAF50' }
                ]}>
                  <Text style={styles.statusText}>活躍中</Text>
                </View>
                <Text style={[styles.currentPetSubtitle, { color: theme.colors.subText }]}>
                  點擊進入養成頁面
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* 中間：打卡狀態和夢想存錢進度條 */}
        <View style={styles.middleSection}>
          {/* 打卡狀態 */}
          <View style={[styles.checkInSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.checkInTitle, { color: theme.colors.text }]}>今日打卡</Text>
            <View style={styles.checkInRow}>
              <View style={styles.checkInItem}>
                <View style={[styles.checkInIcon, dailyCheckStatus.accounting && styles.checkInIconActive]}>
                  <Text style={styles.checkInEmoji}>📊</Text>
                  {dailyCheckStatus.accounting && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkInLabel, { color: theme.colors.text }]}>記帳</Text>
              </View>
              <View style={styles.checkInItem}>
                <View style={[styles.checkInIcon, dailyCheckStatus.diary && styles.checkInIconActive]}>
                  <Text style={styles.checkInEmoji}>📝</Text>
                  {dailyCheckStatus.diary && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkInLabel, { color: theme.colors.text }]}>日記</Text>
              </View>
            </View>
          </View>
          
          {/* 夢想存錢進度條 */}
          {dreamPlans.length > 0 && (
            <View style={[styles.progressSection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.progressTitle, { color: theme.colors.text }]}>夢想存錢進度</Text>
              {dreamPlans.slice(0, 2).map((plan) => {
                const progress = plan.target > 0 ? (plan.current || 0) / plan.target : 0;
                return (
                  <View key={plan.id} style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressPlanName, { color: theme.colors.text }]}>{plan.name}</Text>
                      <Text style={[styles.progressAmount, { color: theme.colors.subText }]}>
                        ${plan.current || 0} / ${plan.target}
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[styles.progressBar, { width: `${Math.min(progress * 100, 100)}%` }]}
                      />
                    </View>
                    <Text style={[styles.progressPercent, { color: theme.colors.subText }]}>
                      {(progress * 100).toFixed(0)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 第一次使用者或無寵物：顯示選擇介面 */}
        {(!selectedPet || isFirstTimeUser) && (
          <View style={styles.petSelectionSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>選擇你的寵物夥伴</Text>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => handlePetSelect(pet)}
              >
                <Image 
                  source={pet.image} 
                  style={styles.petImage}
                  resizeMode="contain"
                  fadeDuration={200}
                  onError={(error) => {
                    console.log(`圖片載入失敗: ${pet.name}`, error);
                  }}
                  onLoad={() => {
                    console.log(`圖片載入成功: ${pet.name}`);
                  }}
                />
                <View style={styles.petInfo}>
                  <Text style={[styles.petName, { color: theme.colors.text }]}>{pet.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 功能面板 */}
      <View style={[styles.functionPanel, { backgroundColor: theme.colors.panel }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>{t('panelTitle')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.buttonRow}>
            {menuButtons.map((button) => (
              <TouchableOpacity 
                key={button.id} 
                style={[
                  styles.menuButton,
                  { zIndex: 1000 },
                  theme.isDark && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', shadowColor: '#000' }
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  const key = button.key;
                  if (key === 'gift') {
                    console.log('執行禮物箱功能');
                    handleGiftBox();
                  } else if (key === 'diary') {
                    console.log('執行日記本功能');
                    handleDiary();
                  } else if (key === 'accounting') {
                    if (!selectedPet) {
                      Alert.alert('提示', '請先選擇一隻寵物');
                      return;
                    }
                    setShowAccountingPage(true);
                  } else if (key === 'savings') {
                    if (!selectedPet) {
                      Alert.alert('提示', '請先選擇一隻寵物');
                      return;
                    }
                    setShowSavingsPage(true);
                  } else if (key === 'myPets') {
                    if (selectedPet) {
                      setShowMyPets(true);
                    } else {
                      Alert.alert('提示', '請先選擇一隻寵物再查看毛小孩們');
                    }
                  } else if (key === 'settings') {
                    setShowSettings(true);
                  }
                }}
              >
                <Text style={[styles.buttonIcon, theme.isDark && { color: '#EDEFF2' }]}>{button.icon}</Text>
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  {button.key === 'myPets' ? t('menu_myPets')
                    : button.key === 'accounting' ? t('accounting')
                    : button.key === 'savings' ? t('savings')
                    : button.key === 'gift' ? t('menu_gift')
                    : button.key === 'diary' ? t('menu_diary')
                    : t('menu_settings')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 毛小孩們模態框 */}
      <Modal
        visible={showMyPets}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMyPets(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>🐾 毛小孩們</Text>
              <TouchableOpacity onPress={() => setShowMyPets(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {selectedPet ? (
                  <>
                    <Image source={selectedPet.image} style={{ width: 140, height: 140, borderRadius: 18, marginBottom: 10 }} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 }}>{selectedPet.name}</Text>
                    <TouchableOpacity
                      onPress={() => { setShowMyPets(false); setShowPetCare(true); }}
                      style={{ backgroundColor: '#1976D2', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 }}
                    >
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>前往養成</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ fontSize: 16, color: theme.colors.subText }}>尚未選擇寵物</Text>
                )}
              </View>

              <Text style={{ fontSize: 14, color: theme.colors.subText, marginBottom: 8 }}>選擇其他寵物</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {pets.map((pet) => {
                  const petStatus = petStatuses[pet.id] || 'idle';
                  const isActive = petStatus === 'active';
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'active': return '#4CAF50'; // 綠色
                      case 'idle': return '#9E9E9E'; // 灰色
                      case 'graduated': return '#FF9800'; // 橙色
                      case 'collected': return '#2196F3'; // 藍色
                      default: return '#9E9E9E';
                    }
                  };
                  const getStatusText = (status) => {
                    switch (status) {
                      case 'active': return '活躍中';
                      case 'idle': return '閒置';
                      case 'graduated': return '已畢業';
                      case 'collected': return '收藏';
                      default: return '閒置';
                    }
                  };
                  
                  return (
                    <TouchableOpacity
                      key={pet.id}
                      onPress={() => handlePetSwitch(pet)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: isActive ? '#4CAF50' : theme.isDark ? '#455A64' : '#E0E0E0',
                        backgroundColor: isActive ? '#E8F5E8' : theme.isDark ? '#263238' : '#FFFFFF',
                      }}
                    >
                      <Image source={pet.image} style={{ width: 50, height: 50, borderRadius: 10, marginRight: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>{pet.name}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(petStatus), marginTop: 4 }
                        ]}>
                          <Text style={styles.statusText}>{getStatusText(petStatus)}</Text>
                        </View>
                      </View>
                      {isActive && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* 日記內容檢視模態框 */}
      <Modal
        visible={showDiaryEntry}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDiaryEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}> 
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>{t('diaryContentTitle')}</Text>
              <TouchableOpacity onPress={() => setShowDiaryEntry(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.diaryContent}>
              {selectedDiaryEntry ? (
                <>
                  <TimestampChip iso={selectedDiaryEntry.createdAt} />
                  <View style={{ height: 10 }} />
                  <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                    {selectedDiaryEntry.content}
                  </Text>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 每日登入獎勵模態框 */}
      <Modal
        visible={showDailyReward}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDailyReward(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.rewardHeader}>
              <Text style={[styles.rewardTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>🎁 每日登入獎勵</Text>
              <TouchableOpacity 
                onPress={() => setShowDailyReward(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.rewardContent}>
              <View style={styles.rewardIconContainer}>
                <Image 
                  source={require('./B/M.png')} 
                  style={styles.rewardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.rewardAmount}>+20</Text>
              </View>
              
              <Text style={[styles.rewardDescription, { color: theme.colors.text }]}>
                每日登入即可領取冰冰幣獎勵！
              </Text>
              
              <Text style={[styles.rewardNote, { color: theme.colors.subText }]}>
                {dailyRewardClaimed ? '今日已領取' : '今日尚未領取'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.claimButton,
                dailyRewardClaimed && styles.claimedButton
              ]}
              onPress={claimDailyReward}
              disabled={dailyRewardClaimed}
            >
              <Text style={styles.claimButtonText}>
                {dailyRewardClaimed ? '已領取' : '立即領取'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 日記本模態框 */}
      <Modal
        visible={showDiary}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDiary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>📝 今日日記</Text>
              <TouchableOpacity onPress={() => setShowDiary(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.diaryContent}>
              {/* 手寫日記區塊 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>✍️ 手寫日記</Text>
                <View style={[styles.diaryInputContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <TextInput
                    style={[styles.diaryInput, { color: theme.colors.text }]}
                    placeholder="寫下今天的心情..."
                    multiline={true}
                    value={diaryContent}
                    onChangeText={setDiaryContent}
                    placeholderTextColor={theme.isDark ? '#94A3B8' : '#999'}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => saveDiary(diaryContent)}
                >
                  <Text style={styles.saveButtonText}>保存日記</Text>
                </TouchableOpacity>
              </View>

              {/* 歷史紀錄按鈕（導向全螢幕頁面） */}
              <View style={styles.diarySection}>
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    backgroundColor: theme.isDark ? '#581C87' : '#F3E8FF',
                    borderWidth: 2,
                    borderColor: theme.isDark ? '#8B5CF6' : '#C4B5FD',
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    shadowColor: theme.isDark ? '#000' : '#8B5CF6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => { setShowDiary(false); setShowDiaryHistory(true); }}
                >
                  <Text style={{ 
                    color: theme.isDark ? '#C4B5FD' : '#6B21A8', 
                    fontWeight: '700', 
                    fontSize: 14 
                  }}>{t('diaryHistory')}</Text>
                </TouchableOpacity>
              </View>

              {/* 寵物語錄區塊 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🐾 寵物語錄</Text>
                <View style={[styles.quoteContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <Text style={[styles.quoteText, { color: theme.colors.text }]}>{generatePetQuote()}</Text>
                </View>
              </View>

              {/* 今日互動統計 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 今日互動統計</Text>
                <View style={[styles.statsContainer, theme.isDark && { backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#334155' }]}>
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>🍖</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>餵食次數</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.feedCount} 次</Text>
                  </View>
                  
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>🧼</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>清潔次數</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.cleanCount} 次</Text>
                  </View>
                  
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>✋</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>摸摸頭</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.petCount} 次</Text>
                  </View>
                  
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>🌲</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>散步次數</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.walkCount} 次</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💗</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>親密度提升</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>+{todayStats.affectionGained}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 設定模態框 */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>⚙️ 設定</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

            <ScrollView style={{ padding: 20 }}>
              {/* 外觀 */}
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>外觀</Text>
                <View style={{ flexDirection: 'row' }}>
                  {['light','dark','system'].map(mode => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setSettings(s => ({ ...s, theme: mode }))}
                      style={[
                        styles.choiceChip,
                        settings.theme === mode && styles.choiceChipActive,
                        { marginRight: 8, backgroundColor: theme.isDark ? '#263238' : '#F0F4F8', borderColor: theme.isDark ? '#455A64' : '#E0E0E0' }
                      ]}
                    >
                      <Text style={[
                        styles.choiceChipText,
                        settings.theme === mode && styles.choiceChipTextActive,
                        !(['dark','light','system'].includes(settings.theme) && settings.theme === mode) && { color: theme.colors.text }
                      ]}>
                        {mode === 'light' ? '淺色' : mode === 'dark' ? '深色' : '跟隨系統'}
                      </Text>
                    </TouchableOpacity>
                  ))}
          </View>
        </View>


            </ScrollView>
      </View>
        </View>
      </Modal>

      {/* 存錢功能模態框 */}
      <Modal
        visible={showSavingsPage}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSavingsPage(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>💰 存錢功能</Text>
              <TouchableOpacity onPress={() => setShowSavingsPage(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.diaryContent}>
              {/* 餘額顯示區塊 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>💎 存錢功能</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.isDark ? '#0B1220' : '#E3F2FD',
                  borderRadius: 12,
                  padding: 15,
                  marginBottom: 15,
                }}>
                  <Ionicons name="wallet" size={22} color="#1976D2" />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: theme.colors.text, 
                    marginLeft: 8 
                  }}>
                    目前累積儲蓄：{savedMoney} 元
                  </Text>
                </View>
              </View>

              {/* 夢想計畫選擇 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>⭐ 選擇夢想計畫</Text>
                {dreamPlans.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 5 }}>
                      {dreamPlans.map(plan => (
                        <TouchableOpacity
                          key={plan.id}
                          onPress={() => setSelectedDreamPlanId(plan.id)}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selectedDreamPlanId === plan.id ? '#1976D2' : '#E0E0E0',
                            backgroundColor: selectedDreamPlanId === plan.id ? '#E3F2FD' : theme.isDark ? '#263238' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ 
                            color: selectedDreamPlanId === plan.id ? '#1976D2' : theme.colors.text,
                            fontSize: 12,
                            fontWeight: selectedDreamPlanId === plan.id ? 'bold' : 'normal'
                          }}>{plan.title}</Text>
                          {plan.target && (
                            <Text style={{ 
                              color: theme.colors.subText, 
                              fontSize: 10, 
                              marginTop: 2 
                            }}>
                              {plan.current || 0}/{plan.target}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={{
                    backgroundColor: theme.isDark ? '#7F1D1D' : '#FEE2E2',
                    borderRadius: 12,
                    padding: 15,
                    borderWidth: 1,
                    borderColor: theme.isDark ? '#EF4444' : '#FECACA',
                  }}>
                    <Text style={{ 
                      color: theme.isDark ? '#FECACA' : '#DC2626',
                      fontSize: 14,
                      textAlign: 'center'
                    }}>
                      📝 尚未建立夢想計畫
                    </Text>
                    <Text style={{ 
                      color: theme.isDark ? '#FCA5A5' : '#EF4444',
                      fontSize: 12,
                      textAlign: 'center',
                      marginTop: 4
                    }}>
                      請先前往寵物頁面的「夢想存錢」功能建立計畫
                    </Text>
                  </View>
                )}
              </View>

              {/* 存入金額區塊 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>💰 存入功能</Text>
                {selectedDreamPlanId && (
                  <Text style={{ 
                    fontSize: 14, 
                    color: theme.colors.subText, 
                    marginBottom: 8 
                  }}>
                    將存入：{dreamPlans.find(p => p.id === selectedDreamPlanId)?.title || ''}
                  </Text>
                )}
                <View style={[styles.diaryInputContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <TextInput
                    style={[styles.diaryInput, { color: theme.colors.text, minHeight: 50 }]}
                    placeholder="輸入存入金額"
                    keyboardType="numeric"
                    value={depositAmount}
                    onChangeText={(t) => {
                      const digits = t.replace(/[^0-9]/g,'');
                      if (digits.length > 8) {
                        Alert.alert('❌ 金額過大', '存入金額最多 8 位數（上限 99,999,999）');
                      }
                      setDepositAmount(digits.slice(0,8));
                    }}
                    placeholderTextColor={theme.isDark ? '#94A3B8' : '#999'}
                  />
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!depositAmount || parseInt(depositAmount) <= 0 || !selectedDreamPlanId) && { backgroundColor: '#BDBDBD' }
                  ]}
                  onPress={() => handleSaveMoney(parseInt(depositAmount))}
                  disabled={!depositAmount || parseInt(depositAmount) <= 0 || !selectedDreamPlanId}
                >
                  <Text style={styles.saveButtonText}>存入</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 記帳功能模態框 */}
      <Modal
        visible={showAccountingPage}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountingPage(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>📊 記帳功能</Text>
              <TouchableOpacity onPress={() => setShowAccountingPage(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.diaryContent}>
              {/* 金額輸入 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>💰 輸入金額</Text>
                <View style={[styles.diaryInputContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <TextInput
                    style={[styles.diaryInput, { color: theme.colors.text, minHeight: 50 }]}
                    placeholder="輸入金額"
                    keyboardType="numeric"
                    value={amountInput}
                    onChangeText={(t) => {
                      const digits = t.replace(/[^0-9]/g,'');
                      if (digits.length > 8) {
                        Alert.alert('❌ 金額過大', '金額最多 8 位數（上限 99,999,999）');
                      }
                      setAmountInput(digits.slice(0,8));
                    }}
                    placeholderTextColor={theme.isDark ? '#94A3B8' : '#999'}
                  />
                </View>
              </View>

              {/* 類型切換 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>✨ 交易類型</Text>
                <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'center' }}>
                  <TouchableOpacity 
                    style={[
                      styles.cuteTypeButton,
                      {
                        borderColor: transactionType === 'expense' ? '#FF6B6B' : '#FFE0E0',
                        backgroundColor: transactionType === 'expense' 
                          ? '#FF6B6B' 
                          : theme.isDark ? '#1F2937' : '#FAFAFA',
                        shadowColor: transactionType === 'expense' ? '#FF6B6B' : 'transparent',
                        elevation: transactionType === 'expense' ? 8 : 2,
                        transform: [{ scale: transactionType === 'expense' ? 1.05 : 1 }],
                      }
                    ]}
                    onPress={() => {
                      setTransactionType('expense');
                      // 自動設定為支出類別
                      const expenseCategories = accountingCategories.filter(cat => cat.type === 'expense');
                      if (expenseCategories.length > 0) {
                        setTransactionCategory(expenseCategories[0].id);
                      }
                    }}
                  >
                    <View style={styles.buttonIconContainer}>
                      <Text style={styles.buttonEmoji}>💸</Text>
                      <Text style={[
                        styles.cuteButtonText,
                        {
                          color: transactionType === 'expense' ? '#FFFFFF' : theme.colors.text,
                          textShadowColor: transactionType === 'expense' ? 'rgba(0,0,0,0.3)' : 'transparent',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }
                      ]}>支出</Text>
                      {transactionType === 'expense' && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.checkMark}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.cuteTypeButton,
                      {
                        borderColor: transactionType === 'income' ? '#10B981' : '#E0F2E0',
                        backgroundColor: transactionType === 'income' 
                          ? '#10B981' 
                          : theme.isDark ? '#1F2937' : '#FAFAFA',
                        shadowColor: transactionType === 'income' ? '#10B981' : 'transparent',
                        elevation: transactionType === 'income' ? 8 : 2,
                        transform: [{ scale: transactionType === 'income' ? 1.05 : 1 }],
                      }
                    ]}
                    onPress={() => {
                      setTransactionType('income');
                      // 自動設定為收入類別
                      const incomeCategories = accountingCategories.filter(cat => cat.type === 'income');
                      if (incomeCategories.length > 0) {
                        setTransactionCategory(incomeCategories[0].id);
                      }
                    }}
                  >
                    <View style={styles.buttonIconContainer}>
                      <Text style={styles.buttonEmoji}>💰</Text>
                      <Text style={[
                        styles.cuteButtonText,
                        {
                          color: transactionType === 'income' ? '#FFFFFF' : theme.colors.text,
                          textShadowColor: transactionType === 'income' ? 'rgba(0,0,0,0.3)' : 'transparent',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }
                      ]}>收入</Text>
                      {transactionType === 'income' && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.checkMark}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 類別選擇 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏷️ 類別</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {accountingCategories
                    .filter(cat => cat.type === transactionType)
                    .map(cat => (
                    <TouchableOpacity 
                      key={cat.id}
                      onPress={() => setTransactionCategory(cat.id)}
                      style={{
                        width: '30%',
                        aspectRatio: 1,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 8,
                        backgroundColor: cat.color,
                        borderWidth: transactionCategory === cat.id ? 3 : 0,
                        borderColor: '#1976D2',
                      }}
                    >
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</Text>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#333', textAlign: 'center' }}>{cat.id}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 備註 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📝 備註（選填）</Text>
                <View style={[styles.diaryInputContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <TextInput
                    style={[styles.diaryInput, { color: theme.colors.text, minHeight: 50 }]}
                    placeholder="輸入備註..."
                    value={transactionNote}
                    onChangeText={setTransactionNote}
                    placeholderTextColor={theme.isDark ? '#94A3B8' : '#999'}
                  />
                </View>
              </View>

              {/* 新增按鈕 */}
              <View style={styles.diarySection}>
                <TouchableOpacity 
                  style={[
                    styles.cuteAddButton,
                    {
                      backgroundColor: (!amountInput || parseInt(amountInput) <= 0) 
                        ? '#BDBDBD' 
                        : (transactionType === 'expense' ? '#FF6B6B' : '#10B981'),
                      shadowColor: (!amountInput || parseInt(amountInput) <= 0) 
                        ? 'transparent' 
                        : (transactionType === 'expense' ? '#FF6B6B' : '#10B981'),
                      elevation: (!amountInput || parseInt(amountInput) <= 0) ? 2 : 8,
                    }
                  ]}
                  onPress={handleAddTransaction}
                  disabled={!amountInput || parseInt(amountInput) <= 0}
                >
                  <View style={styles.addButtonContent}>
                    <Text style={styles.addButtonEmoji}>
                      {transactionType === 'expense' ? '📤' : '📥'}
                    </Text>
                    <Text style={styles.cuteAddButtonText}>
                      新增{transactionType === 'expense' ? '支出' : '收入'}
                    </Text>
                    <Text style={styles.addButtonSubtext}>
                      💖 記錄每一筆交易
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 交易歷史記錄 */}
              {transactions.length > 0 && (
                <View style={styles.diarySection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📋 最近交易</Text>
                  <View style={[styles.transactionHistory, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                    {transactions.slice(0, 5).map((transaction, index) => {
                      const category = accountingCategories.find(cat => cat.id === transaction.category);
                      const isExpense = transaction.type === 'expense';
                      return (
                        <View key={transaction.id} style={[
                          styles.transactionItem,
                          index !== Math.min(4, transactions.length - 1) && styles.transactionItemBorder
                        ]}>
                          <View style={styles.transactionLeft}>
                            <View style={[styles.transactionIcon, { backgroundColor: category?.color || '#E0E0E0' }]}>
                              <Text style={styles.transactionIconText}>{category?.icon || '💰'}</Text>
                            </View>
                            <View style={styles.transactionInfo}>
                              <Text style={[styles.transactionCategory, { color: theme.colors.text }]}>
                                {transaction.category}
                              </Text>
                              {transaction.note && (
                                <Text style={[styles.transactionNote, { color: theme.isDark ? '#94A3B8' : '#666' }]}>
                                  {transaction.note.length > 20 ? transaction.note.substring(0, 20) + '...' : transaction.note}
                                </Text>
                              )}
                              <Text style={[styles.transactionDate, { color: theme.isDark ? '#94A3B8' : '#999' }]}>
                                {new Date(transaction.date).toLocaleDateString('zh-TW', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.transactionRight}>
                            <Text style={[
                              styles.transactionAmount,
                              { color: isExpense ? '#EF4444' : '#10B981' }
                            ]}>
                              {isExpense ? '-' : '+'}${transaction.amount}
                            </Text>
                            <Text style={[styles.transactionType, { color: isExpense ? '#EF4444' : '#10B981' }]}>
                              {isExpense ? '支出' : '收入'}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                    {transactions.length > 5 && (
                      <View style={styles.moreTransactions}>
                        <Text style={[styles.moreTransactionsText, { color: theme.isDark ? '#94A3B8' : '#666' }]}>
                          還有 {transactions.length - 5} 筆交易...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );



  // 主要的應用程式邏輯
  if (showPetCare && selectedPet) {
    return (
      <PetCareScreen
        selectedPet={selectedPet}
        onBack={() => {
          setShowPetCare(false);
          setOpenAccountingFlag(false);
          setOpenSavingsFlag(false);
        }}
        dailyRewardClaimed={dailyRewardClaimed}
        onDailyRewardClaimed={() => setDailyRewardClaimed(false)}
        todayStats={todayStats}
        setTodayStats={setTodayStats}
        petQuoteTriggered={petQuoteTriggered}
        setPetQuoteTriggered={setPetQuoteTriggered}
        isDarkTheme={theme.isDark}
        language={settings.language}
        iceCoins={iceCoins}
        setIceCoins={setIceCoins}
        openAccounting={openAccountingFlag}
        openSavings={openSavingsFlag}
        dreamPlans={dreamPlans}
        setDreamPlans={setDreamPlans}
        savedMoney={savedMoney}
        setSavedMoney={setSavedMoney}
        transactions={transactions}
        setTransactions={setTransactions}
      />
    );
  } else if (showDiaryHistory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={[styles.header, { backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF', borderBottomColor: theme.colors.border }]}> 
          <TouchableOpacity onPress={() => setShowDiaryHistory(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('diaryHistory')}</Text>
        </View>

        <ScrollView style={{ padding: 20 }}>
          {diaryEntries.length === 0 ? (
            <Text style={{ color: theme.colors.subText, textAlign: 'center', marginTop: 30 }}>{t('diaryNone')}</Text>
          ) : (
            diaryEntries.map(entry => (
              <View key={entry.id} style={{
                backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF',
                borderWidth: 1,
                borderColor: theme.isDark ? '#334155' : '#E3F2FD',
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}>
                <TimestampChip iso={entry.createdAt} />
                <View style={{ height: 6 }} />
                <Text style={{ color: theme.colors.text, marginBottom: 10 }} numberOfLines={3}>
                  {entry.content}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => { setSelectedDiaryEntry(entry); setShowDiaryEntry(true); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.isDark ? '#0F172A' : '#DBEAFE',
                      borderWidth: 2,
                      borderColor: theme.isDark ? '#1E40AF' : '#93C5FD',
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      marginRight: 8,
                      shadowColor: theme.isDark ? '#000' : '#3B82F6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ marginRight: 4, fontSize: 12 }}>👀</Text>
                    <Text style={{ 
                      color: theme.isDark ? '#93C5FD' : '#1E40AF', 
                      fontWeight: '700', 
                      fontSize: 12 
                    }}>{t('viewDiary')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('刪除確認', '確定要刪除此日記嗎？', [
                        { text: '取消', style: 'cancel' },
                        { text: t('delete'), style: 'destructive', onPress: () => setDiaryEntries(prev => prev.filter(e => e.id !== entry.id)) }
                      ]);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.isDark ? '#7F1D1D' : '#FEE2E2',
                      borderWidth: 2,
                      borderColor: theme.isDark ? '#EF4444' : '#FECACA',
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      shadowColor: theme.isDark ? '#000' : '#EF4444',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ marginRight: 4, fontSize: 12 }}>🗑️</Text>
                    <Text style={{ 
                      color: theme.isDark ? '#FECACA' : '#DC2626', 
                      fontWeight: '700', 
                      fontSize: 12 
                    }}>{t('delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* 日記內容檢視模態框（歷史頁也可查看） */}
        <Modal
          visible={showDiaryEntry}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDiaryEntry(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}> 
              <View style={styles.diaryHeader}>
                <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>{t('diaryContentTitle')}</Text>
                <TouchableOpacity onPress={() => setShowDiaryEntry(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.diaryContent}>
                {selectedDiaryEntry ? (
                  <>
                    <TimestampChip iso={selectedDiaryEntry.createdAt} />
                    <View style={{ height: 10 }} />
                    <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                      {selectedDiaryEntry.content}
                    </Text>
                  </>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  } else {
    return (
      <>
        {renderHomeScreen()}
        
        {/* 第一次使用者寵物選擇模態框 */}
        <Modal
          visible={showPetSelection}
          transparent={false}
          animationType="slide"
        >
          <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF', borderBottomColor: theme.colors.border }]}>
              <Text style={styles.appTitle}>{t('firstTimeTitle')}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.subText }]}>{t('firstTimeMessage')}</Text>
            </View>
            
            <ScrollView style={styles.petList} showsVerticalScrollIndicator={false}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petCard, styles.firstTimePetCard]}
                  onPress={() => handleFirstTimePetSelect(pet)}
                >
                  <Image 
                    source={pet.image} 
                    style={styles.petImage}
                    resizeMode="contain"
                  />
                  <View style={styles.petInfo}>
                    <Text style={[styles.petName, { color: theme.colors.text }]}>{pet.name}</Text>
                    <Text style={[styles.selectPetButton, { color: '#6366F1' }]}>
                      {t('selectPet')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#6366F1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* 歡迎對話框 */}
        <Modal
          visible={showWelcomeDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWelcomeDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.welcomeModal, { backgroundColor: theme.colors.card }]}>
              <View style={styles.welcomeContent}>
                <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
                  {t('welcomeTitle')}
                </Text>
                <Text style={[styles.welcomeMessage, { color: theme.colors.subText }]}>
                  {t('welcomeMessage')}
                </Text>
                <TouchableOpacity
                  style={styles.welcomeButton}
                  onPress={() => setShowWelcomeDialog(false)}
                >
                  <Text style={styles.welcomeButtonText}>{t('gotIt')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#F8FBFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366F1',          // 現代紫色
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(99, 102, 241, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 5,
  },
  petList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activePetCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  currentPetCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FBFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  currentPetImage: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
  currentPetInfo: {
    flex: 1,
  },
  currentPetName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentPetSubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  firstTimePetCard: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#F0F0FF',
  },
  selectPetButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeModal: {
    width: '85%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  welcomeButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  welcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 可愛按鈕樣式
  cuteTypeButton: {
    width: 120,
    height: 80,
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  buttonIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  cuteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  checkMark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  
  // 可愛新增按鈕樣式
  cuteAddButton: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginTop: 10,
  },
  
  addButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  addButtonEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  
  cuteAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  addButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.9,
  },
  
  // 交易歷史記錄樣式
  transactionHistory: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  transactionIconText: {
    fontSize: 18,
  },
  
  transactionInfo: {
    flex: 1,
  },
  
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  transactionNote: {
    fontSize: 12,
    marginBottom: 2,
  },
  
  transactionDate: {
    fontSize: 11,
  },
  
  transactionRight: {
    alignItems: 'flex-end',
  },
  
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  transactionType: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  moreTransactions: {
    paddingTop: 12,
    alignItems: 'center',
  },
  
  moreTransactionsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // 新的首頁排版樣式
  homeContent: {
    flex: 1,
  },
  
  activePetSection: {
    padding: 20,
  },
  
  middleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  petSelectionSection: {
    padding: 20,
  },
  
  // 打卡狀態樣式
  checkInSection: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  checkInTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  checkInRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  checkInItem: {
    alignItems: 'center',
  },
  
  checkInIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  
  checkInIconActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  
  checkInEmoji: {
    fontSize: 24,
  },
  
  checkMark: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    borderRadius: 10,
  },
  
  checkInLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // 夢想存錢進度條樣式
  progressSection: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  progressItem: {
    marginBottom: 15,
  },
  
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  progressPlanName: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  progressAmount: {
    fontSize: 14,
  },
  
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  progressPercent: {
    fontSize: 12,
    textAlign: 'right',
  },

  functionPanel: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  menuButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },

  statusInfo: {
    width: '100%',
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  startButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  loadingText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  closeButton: {
    padding: 5,
  },
  rewardContent: {
    padding: 20,
    alignItems: 'center',
  },
  rewardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  rewardDescription: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 10,
  },
  rewardNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  claimButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    margin: 20,
    alignItems: 'center',
  },
  claimedButton: {
    backgroundColor: '#BDBDBD',
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingsLabel: {
    fontSize: 14,
    color: '#333',
  },
  choiceChip: {
    backgroundColor: '#F0F4F8',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  choiceChipActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  choiceChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#1976D2',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingsInputRow: {
    marginBottom: 16,
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  timePickerContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeDisplayContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeDisplayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  timeSliderContainer: {
    alignItems: 'center',
    flex: 1,
  },
  timeSliderHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  timeSliderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  timeSliderWrapper: {
    position: 'relative',
    width: '100%',
  },
  timeSlider: {
    height: 140,
    width: '100%',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  centerIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: -24,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 40,
  },
  timeSeparatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timeOption: {
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 0,
    marginHorizontal: 6,
  },
  timeOptionActive: {
    backgroundColor: '#2196F3',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exportBox: {
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E3F2FD',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  exportLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  exportText: {
    fontSize: 12,
    color: '#424242',
  },
  importBox: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  importInput: {
    minHeight: 80,
    fontSize: 12,
    color: '#424242',
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  diaryModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  diaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  diaryContent: {
    padding: 20,
  },
  diarySection: {
    marginBottom: 25,
  },
  diaryInputContainer: {
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  diaryInput: {
    minHeight: 100,
    fontSize: 14,
    color: '#424242',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quoteContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  quoteText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  statsContainer: {
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statIcon: {
    fontSize: 20,
    width: 30,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },

});
    