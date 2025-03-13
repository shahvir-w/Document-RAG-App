from langchain_core.prompts import ChatPromptTemplate
import uuid
from langchain.chat_models import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class AgenticChunker:
    def __init__(self, openai_api_key=None):
        self.chunks = {}
        self.id_truncate_limit = 5
        self.generate_new_metadata_ind = True
        self.print_logging = True

        if openai_api_key is None:
            openai_api_key = os.getenv("OPENAI_API_KEY")

        if openai_api_key is None:
            raise ValueError("API key is not provided and not found in environment variables")

        self.llm = ChatOpenAI(model='gpt-3.5-turbo', openai_api_key=openai_api_key, temperature=0)

    def add_propositions(self, propositions):
        for proposition in propositions:
            self.add_proposition(proposition)

    def add_proposition(self, proposition):
        if self.print_logging:
            print(f"\nAdding: '{proposition}'")

        if len(self.chunks) == 0:
            if self.print_logging:
                print("No chunks, creating a new one")
            self._create_new_chunk(proposition)
            return

        chunk_id = self._find_relevant_chunk(proposition)

        if chunk_id:
            if self.print_logging:
                print(f"Chunk Found ({self.chunks[chunk_id]['chunk_id']}), adding to: {self.chunks[chunk_id]['title']}")
            self.add_proposition_to_chunk(chunk_id, proposition)
        else:
            if self.print_logging:
                print("No chunks found")
            self._create_new_chunk(proposition)

    def add_proposition_to_chunk(self, chunk_id, proposition):
        self.chunks[chunk_id]['propositions'].append(proposition)

        if self.generate_new_metadata_ind:
            self.chunks[chunk_id]['summary'] = self._update_chunk_summary(self.chunks[chunk_id])
            self.chunks[chunk_id]['title'] = self._update_chunk_title(self.chunks[chunk_id])

    def _update_chunk_summary(self, chunk):
        PROMPT = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
                    You are the steward of a group of chunks which represent groups of sentences that talk about a similar topic.
                    A new proposition was just added to one of your chunks. Generate a very brief 1-sentence summary.
                    """,
                ),
                ("user", "Chunk's propositions:\n{proposition}\n\nCurrent chunk summary:\n{current_summary}"),
            ]
        )

        runnable = PROMPT | self.llm
        new_chunk_summary = runnable.invoke({
            "proposition": "\n".join(chunk['propositions']),
            "current_summary": chunk['summary']
        }).content

        return new_chunk_summary

    def _update_chunk_title(self, chunk):
        PROMPT = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
                    You are the steward of a group of chunks which represent groups of sentences that talk about a similar topic.
                    A new proposition was just added to one of your chunks. Generate a very brief updated chunk title.
                    """,
                ),
                ("user", "Chunk's propositions:\n{proposition}\n\nChunk summary:\n{current_summary}\n\nCurrent chunk title:\n{current_title}"),
            ]
        )

        runnable = PROMPT | self.llm
        updated_chunk_title = runnable.invoke({
            "proposition": "\n".join(chunk['propositions']),
            "current_summary": chunk['summary'],
            "current_title": chunk['title']
        }).content

        return updated_chunk_title

    def _get_new_chunk_summary(self, proposition):
        PROMPT = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
                    You are the steward of a group of chunks which represent groups of sentences that talk about a similar topic.
                    Generate a very brief 1-sentence summary for a new chunk.
                    """,
                ),
                ("user", "Determine the summary of the new chunk that this proposition will go into:\n{proposition}"),
            ]
        )

        runnable = PROMPT | self.llm
        new_chunk_summary = runnable.invoke({
            "proposition": proposition
        }).content

        return new_chunk_summary

    def _get_new_chunk_title(self, summary):
        PROMPT = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
                    You are the steward of a group of chunks which represent groups of sentences that talk about a similar topic.
                    Generate a very brief few-word chunk title.
                    """,
                ),
                ("user", "Determine the title of the chunk that this summary belongs to:\n{summary}"),
            ]
        )

        runnable = PROMPT | self.llm
        new_chunk_title = runnable.invoke({
            "summary": summary
        }).content

        return new_chunk_title

    def _create_new_chunk(self, proposition):
        new_chunk_id = str(uuid.uuid4())[:self.id_truncate_limit]
        new_chunk_summary = self._get_new_chunk_summary(proposition)
        new_chunk_title = self._get_new_chunk_title(new_chunk_summary)

        self.chunks[new_chunk_id] = {
            'chunk_id': new_chunk_id,
            'propositions': [proposition],
            'title': new_chunk_title,
            'summary': new_chunk_summary,
            'chunk_index': len(self.chunks)
        }

        if self.print_logging:
            print(f"Created new chunk ({new_chunk_id}): {new_chunk_title}")

    def get_chunk_outline(self):
        chunk_outline = ""
        for chunk_id, chunk in self.chunks.items():
            single_chunk_string = f"""Chunk ID: {chunk['chunk_id']}\nChunk Name: {chunk['title']}\nChunk Summary: {chunk['summary']}\n\n"""
            chunk_outline += single_chunk_string
        return chunk_outline

    def _find_relevant_chunk(self, proposition):
        current_chunk_outline = self.get_chunk_outline()

        PROMPT = ChatPromptTemplate.from_messages([
            (
                "system",
                """
                You are tasked with determining if a proposition belongs to any existing chunks.
                If it belongs to a chunk, respond ONLY with that chunk's ID.
                If it doesn't belong to any chunk, respond with "No chunks".
                Be precise and only output the chunk ID or "No chunks".
                """,
            ),
            ("user", "Current Chunks:\n--Start of current chunks--\n{current_chunk_outline}\n--End of current chunks--"),
            ("user", "Determine if the following statement should belong to one of the chunks outlined:\n{proposition}"),
        ])

        runnable = PROMPT | self.llm
        chunk_found = runnable.invoke({
            "proposition": proposition,
            "current_chunk_outline": current_chunk_outline
        }).content.strip()

        # If the response is "No chunks" or doesn't match our ID length, return None
        if chunk_found == "No chunks" or len(chunk_found) != self.id_truncate_limit:
            return None

        # Verify the chunk ID exists in our chunks
        if chunk_found in self.chunks:
            return chunk_found
        
        return None

    def get_chunks(self, get_type='dict'):
        if get_type == 'dict':
            return self.chunks
        if get_type == 'list_of_strings':
            chunks = []
            for chunk_id, chunk in self.chunks.items():
                chunks.append(" ".join([x for x in chunk['propositions']]))
            return chunks

    def pretty_print_chunks(self):
        print(f"\nYou have {len(self.chunks)} chunks\n")
        for chunk_id, chunk in self.chunks.items():
            print(f"Chunk #{chunk['chunk_index']}")
            print(f"Chunk ID: {chunk_id}")
            print(f"Summary: {chunk['summary']}")
            print(f"Propositions:")
            for prop in chunk['propositions']:
                print(f"    -{prop}")
            print("\n\n")

    def pretty_print_chunk_outline(self):
        print("Chunk Outline\n")
        print(self.get_chunk_outline())