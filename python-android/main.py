"""
SpeakEasy Language Learning - Python Android App
Built with Kivy for cross-platform Android support
"""

from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.spinner import Spinner
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.core.window import Window
from kivy.graphics import Color, Rectangle
from kivy.clock import Clock
import requests
import json
import os

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "https://speakeasy-python-web-vlxo5frhwq-uc.a.run.app")

class HomeScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=10)

        # Header
        header = Label(
            text='🌍 SpeakEasy',
            size_hint=(1, 0.15),
            font_size='32sp',
            bold=True,
            color=(1, 1, 1, 1)
        )

        # Language selection
        lang_layout = BoxLayout(size_hint=(1, 0.1), spacing=10)
        lang_label = Label(text='Language:', size_hint=(0.3, 1))
        self.language_spinner = Spinner(
            text='Spanish',
            values=('Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese'),
            size_hint=(0.7, 1)
        )
        lang_layout.add_widget(lang_label)
        lang_layout.add_widget(self.language_spinner)

        # Level selection
        level_layout = BoxLayout(size_hint=(1, 0.1), spacing=10)
        level_label = Label(text='Level:', size_hint=(0.3, 1))
        self.level_spinner = Spinner(
            text='Beginner',
            values=('Beginner', 'Intermediate', 'Advanced'),
            size_hint=(0.7, 1)
        )
        level_layout.add_widget(level_label)
        level_layout.add_widget(self.level_spinner)

        # Buttons
        btn_layout = BoxLayout(size_hint=(1, 0.2), spacing=10)

        gen_story_btn = Button(
            text='Generate Story',
            background_color=(0.4, 0.5, 0.9, 1),
            bold=True
        )
        gen_story_btn.bind(on_press=self.generate_story)

        practice_btn = Button(
            text='Practice Chat',
            background_color=(0.5, 0.3, 0.8, 1),
            bold=True
        )
        practice_btn.bind(on_press=self.go_to_practice)

        btn_layout.add_widget(gen_story_btn)
        btn_layout.add_widget(practice_btn)

        # Story display area
        self.story_scroll = ScrollView(size_hint=(1, 0.45))
        self.story_label = Label(
            text='Your generated story will appear here...',
            size_hint_y=None,
            text_size=(Window.width - 60, None),
            halign='left',
            valign='top',
            padding=(10, 10)
        )
        self.story_label.bind(texture_size=self.story_label.setter('size'))
        self.story_scroll.add_widget(self.story_label)

        # Add all widgets
        self.layout.add_widget(header)
        self.layout.add_widget(lang_layout)
        self.layout.add_widget(level_layout)
        self.layout.add_widget(btn_layout)
        self.layout.add_widget(self.story_scroll)

        self.add_widget(self.layout)

    def generate_story(self, instance):
        self.story_label.text = 'Generating your story...'

        # Make API call in background
        Clock.schedule_once(lambda dt: self._fetch_story(), 0.1)

    def _fetch_story(self):
        try:
            language = self.language_spinner.text
            level = self.level_spinner.text.lower()

            response = requests.post(
                f'{API_BASE_URL}/api/stories/generate',
                json={
                    'target_language': language,
                    'level': level,
                    'interests': ['general']
                },
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    story = json.loads(data['story'])
                    self.story_label.text = f"[b]{story['title']}[/b]\n\n{story['content']}"
                else:
                    self.story_label.text = 'Failed to generate story. Please try again.'
            else:
                self.story_label.text = f'Error: {response.status_code}'

        except Exception as e:
            self.story_label.text = f'Error: {str(e)}'

    def go_to_practice(self, instance):
        self.manager.current = 'practice'


class PracticeScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.conversation_history = []
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=10)

        # Header
        header_layout = BoxLayout(size_hint=(1, 0.1), spacing=10)
        back_btn = Button(text='← Back', size_hint=(0.3, 1))
        back_btn.bind(on_press=self.go_back)
        header_title = Label(text='💬 Practice Chat', size_hint=(0.7, 1), font_size='24sp', bold=True)
        header_layout.add_widget(back_btn)
        header_layout.add_widget(header_title)

        # Language selection
        lang_layout = BoxLayout(size_hint=(1, 0.08), spacing=10)
        lang_label = Label(text='Language:', size_hint=(0.3, 1))
        self.language_spinner = Spinner(
            text='Spanish',
            values=('Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese'),
            size_hint=(0.7, 1)
        )
        lang_layout.add_widget(lang_label)
        lang_layout.add_widget(self.language_spinner)

        # Chat display
        self.chat_scroll = ScrollView(size_hint=(1, 0.62))
        self.chat_layout = GridLayout(cols=1, spacing=10, size_hint_y=None)
        self.chat_layout.bind(minimum_height=self.chat_layout.setter('height'))
        self.chat_scroll.add_widget(self.chat_layout)

        # Input area
        input_layout = BoxLayout(size_hint=(1, 0.15), spacing=10)
        self.message_input = TextInput(
            hint_text='Type your message...',
            multiline=False,
            size_hint=(0.7, 1)
        )
        self.message_input.bind(on_text_validate=self.send_message)

        send_btn = Button(
            text='Send',
            size_hint=(0.3, 1),
            background_color=(0.4, 0.5, 0.9, 1),
            bold=True
        )
        send_btn.bind(on_press=self.send_message)

        input_layout.add_widget(self.message_input)
        input_layout.add_widget(send_btn)

        # Add all widgets
        self.layout.add_widget(header_layout)
        self.layout.add_widget(lang_layout)
        self.layout.add_widget(self.chat_scroll)
        self.layout.add_widget(input_layout)

        self.add_widget(self.layout)

        # Add welcome message
        self.add_chat_message('assistant', 'Hello! Let\'s practice together. Start by saying something in your target language!')

    def add_chat_message(self, role, text):
        msg_box = BoxLayout(size_hint_y=None, height=60, padding=5)

        if role == 'user':
            msg_box.add_widget(Label(size_hint=(0.2, 1)))  # Spacer
            msg_label = Label(
                text=text,
                size_hint=(0.8, 1),
                text_size=(Window.width * 0.6, None),
                halign='right',
                color=(1, 1, 1, 1)
            )
            with msg_label.canvas.before:
                Color(0.4, 0.5, 0.9, 1)
                msg_label.rect = Rectangle(pos=msg_label.pos, size=msg_label.size)
            msg_label.bind(pos=self.update_rect, size=self.update_rect)
        else:
            msg_label = Label(
                text=text,
                size_hint=(0.8, 1),
                text_size=(Window.width * 0.6, None),
                halign='left',
                color=(0, 0, 0, 1)
            )
            with msg_label.canvas.before:
                Color(0.9, 0.9, 0.9, 1)
                msg_label.rect = Rectangle(pos=msg_label.pos, size=msg_label.size)
            msg_label.bind(pos=self.update_rect, size=self.update_rect)
            msg_box.add_widget(Label(size_hint=(0.2, 1)))  # Spacer

        msg_box.add_widget(msg_label)
        self.chat_layout.add_widget(msg_box)

        # Scroll to bottom
        Clock.schedule_once(lambda dt: setattr(self.chat_scroll, 'scroll_y', 0), 0.1)

    def update_rect(self, instance, value):
        instance.rect.pos = instance.pos
        instance.rect.size = instance.size

    def send_message(self, instance):
        message = self.message_input.text.strip()
        if not message:
            return

        # Add user message
        self.add_chat_message('user', message)
        self.message_input.text = ''

        # Add to history
        self.conversation_history.append({'role': 'user', 'content': message})

        # Show loading
        self.add_chat_message('assistant', 'Thinking...')

        # Fetch response
        Clock.schedule_once(lambda dt: self._fetch_response(message), 0.1)

    def _fetch_response(self, message):
        try:
            language = self.language_spinner.text

            response = requests.post(
                f'{API_BASE_URL}/api/practice/chat',
                json={
                    'message': message,
                    'target_language': language,
                    'conversation_history': self.conversation_history
                },
                timeout=30
            )

            # Remove loading message
            if len(self.chat_layout.children) > 0:
                self.chat_layout.remove_widget(self.chat_layout.children[0])

            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    assistant_msg = data['message']
                    self.conversation_history.append({'role': 'assistant', 'content': assistant_msg})
                    self.add_chat_message('assistant', assistant_msg)
                else:
                    self.add_chat_message('assistant', 'Sorry, I had trouble responding. Please try again.')
            else:
                self.add_chat_message('assistant', f'Error: {response.status_code}')

        except Exception as e:
            # Remove loading message
            if len(self.chat_layout.children) > 0:
                self.chat_layout.remove_widget(self.chat_layout.children[0])
            self.add_chat_message('assistant', f'Error: {str(e)}')

    def go_back(self, instance):
        self.manager.current = 'home'


class SpeakEasyApp(App):
    def build(self):
        # Set window properties
        Window.clearcolor = (0.4, 0.5, 0.9, 1)

        # Create screen manager
        sm = ScreenManager()
        sm.add_widget(HomeScreen(name='home'))
        sm.add_widget(PracticeScreen(name='practice'))

        return sm


if __name__ == '__main__':
    SpeakEasyApp().run()
