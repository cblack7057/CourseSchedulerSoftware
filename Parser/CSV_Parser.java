package parser;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

/**
 * NOTE* Before Feeding in the CSV file you must make sure there are NO new line characters within a cell and no commas within a cell.
 * NOTE* When you remove the new line characters replace them with a '`'
 *
 */
public class CSV_Parser 
{
	static BufferedReader reader;
	static BufferedWriter writer;

	public static void main(String[] args) throws IOException
	{
		reader = new BufferedReader(new FileReader("Section_Tally_RAW.csv"));
		writer = new BufferedWriter(new FileWriter("Section_Tally_FORMAT.csv"));

		formatHeader(reader.readLine());

		while(reader.ready())
		{
			formatLine(reader.readLine());
		}


	}

	private static void formatHeader(String readLine) throws IOException
	{
		/*
		 * Desired Order:
		 * Subject
		 * Course
		 * Section
		 * Type
		 * Days
		 * Times
		 * Building + Room
		 * Dates
		 * CRN
		 * Title
		 * Professor
		 * Campus
		 * Credit Hours
		 */

		/*
		 * Given Order:
		 * 0 CRN
		 * 1 Subject
		 * 2 Course
		 * 3 Section
		 * 4 Part of Term
		 * 5 Dates
		 * 6 Title
		 * 7 Professor
		 * 8 Day + Times + Building + Room + Type
		 * 9 Campus
		 * 10 Additional Info
		 * 11 Credit Hours
		 * Max
		 * MaxResv
		 * LeftResv
		 * Enr
		 * Array?
		 * Room Cap
		 */
		String formatedString;

		String[] line = readLine.split(",");
		if(line.length == 0)
		{
			System.err.println("This line has no information");
			return;
		}

		//Parse the Day + Times + Building + Room + Type 
		/*
		 * 0 Day
		 * 1 Start Time
		 * 2 End Time
		 * 3 Building
		 * 4 Room Number
		 * 5 Type
		 * Possible Repeat
		 */
		String dayAndTimeString[] = line[8].split("[ ]{1,}");


		//Add the Subject to the String
		formatedString = line[1];

		//Add the Course to the String
		formatedString += "," + line[2];

		//Add the Section to the String
		formatedString += "," + line[3];

		/*
		 * Add Type, Days, Time,
		 */
		for(int i = 0; i < 11; i++)
		{
			//Add the Type to the String
			formatedString += "," + dayAndTimeString[5] + " " + i;

			//Add the Days to the String
			formatedString += "," + dayAndTimeString[0]+ " " + i;

			//Add the Time to the String
			formatedString += ",Times " + i;

			//Add the building and room to the String
			formatedString += ", Building and Room" + " " + i;
		}

		//Add the Dates to the String
		formatedString += "," + line[5];

		//Add the CRN to the String
		formatedString += "," + line[0];

		//Add the Title to the String
		formatedString += "," + line[6];

		//Add the Professor to the String
		formatedString += "," + line[7].replaceAll("[ ]{2,}", " ");

		//Add the Campus to the String
		formatedString += "," + line[9];

		//Add the Credit Hours to the String
		formatedString += "," + line[11] + "\n";


		writer.write(formatedString);
		writer.flush();
	}
	private static void formatLine(String readLine) throws IOException 
	{
		/*
		 * Desired Order:
		 * Subject
		 * Course
		 * Section
		 * Type
		 * Days
		 * Times
		 * Building + Room
		 * Dates
		 * CRN
		 * Title
		 * Professor
		 * Campus
		 * Credit Hours
		 */

		/*
		 * Given Order:
		 * 0 CRN
		 * 1 Subject
		 * 2 Course
		 * 3 Section
		 * 4 Part of Term
		 * 5 Dates
		 * 6 Title
		 * 7 Professor
		 * 8 Day + Times + Building + Room + Type
		 * 9 Campus
		 * 10 Additional Info
		 * 11 Credit Hours
		 * Max
		 * MaxResv
		 * LeftResv
		 * Enr
		 * Array?
		 * Room Cap
		 */
		//String to be written at the end
		String formatedString = "";

		String[] line = readLine.split(",");
		if(line.length == 0)
		{
			System.err.println("This line has no information");
			return;
		}

		//Parse the Day + Times + Building + Room + Type 
		/*
		 * 0 Day
		 * 1 Start Time
		 * 2 End Time
		 * 3 Building
		 * 4 Room Number
		 * 5 Type
		 * Possible Repeat
		 */
		int counter = 44;

		//Add the Subject to the String
		formatedString = line[1];

		//Add the Course to the String
		formatedString += "," + line[2];

		//Add the Section to the String
		formatedString += "," + line[3];

		String dayAndTimeSuperString[] = line[8].split("`");

		for(String dayAndTime : dayAndTimeSuperString)
		{
			String dayAndTimeString[] = dayAndTime.split("[ ]{1,}");

			/*
			 * Add Type, Days, Time,
			 */
			//Break down the days and times and stores them 
			//If Days are grouped together, I.E. MW then separate them into M and W.
			//the counter is the number of spaces left to finish out empty time slots
			if(dayAndTimeString.length == 6)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(String day : dayString)
				{
					//Add the Type to the String
					formatedString += "," + dayAndTimeString[5];

					//Add the Days to the String
					formatedString += "," + day;

					//Add the Time to the String
					formatedString += "," + dayAndTimeString[1] + " to " + dayAndTimeString[2];

					//Add the Building and Room to the String
					formatedString += "," + dayAndTimeString[3] + " " + dayAndTimeString[4];

					counter = counter - 4;
				}

			}
			else if(dayAndTimeString.length == 4)
			{
				String dayString[] = dayAndTimeString[0].split("");

				//Now loop through the dayString and create days and times for each day.
				for(String day : dayString)
				{
					//Add the Type to the String
					formatedString += "," + dayAndTimeString[3];

					//Add the Days to the String
					formatedString += "," + day;

					//Add the Time to the String
					formatedString += "," + dayAndTimeString[1] + " to " + dayAndTimeString[2];

					//Add the Building and Room to the String
					formatedString += ",";

					counter = counter - 4;
				}


			}
		}

		//Counter takes care of length == 0 case.
		while(counter > 0)
		{
			formatedString += ",";
			counter --;
		}


		//Add the Dates to the String
		formatedString += "," + line[5];

		//Add the CRN to the String
		formatedString += "," + line[0];

		//Add the Title to the String
		formatedString += "," + line[6];

		//Add the Professor to the String
		formatedString += "," + line[7].replaceAll("[ ]{2,}", " ");

		//Add the Campus to the String
		formatedString += "," + line[9];

		//Add the Credit Hours to the String
		formatedString += "," + line[11] + "\n";


		writer.write(formatedString);
		writer.flush();
	}
}

